#!/usr/bin/env python3
"""Deploy this Next.js app to Hostinger Node.js hosting.

Hostinger builds on the server: you upload a source archive, then start a
build. Passenger serves the result out of hbuilds/current/nodejs.

Flow:
  1. write .env.production from $FE_ENV_PRODUCTION
  2. zip the git-tracked files plus that .env
  3. upload the zip over TUS to the website's file storage
  4. start a Node build and poll it to completion

Why .env.production goes inside the archive: the build API has no field for
environment variables, and NEXT_PUBLIC_* values are inlined at build time.
Changing them therefore needs a rebuild, not a restart.

Env:
  HOSTINGER_API_TOKEN   required
  FE_ENV_PRODUCTION     required, full body of .env.production
  HOSTINGER_USERNAME    required - this repo is public, so the hosting
                        account name is not hardcoded here
  HOSTINGER_DOMAIN      default app.urclass.id
  NODE_MAJOR            default 22 (next 16 needs >= 20.9)
"""
import json
import os
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
import zipfile

TOKEN = os.environ.get("HOSTINGER_API_TOKEN", "").strip()
ENV_BODY = os.environ.get("FE_ENV_PRODUCTION", "")
USER = os.environ.get("HOSTINGER_USERNAME", "").strip()
DOMAIN = os.environ.get("HOSTINGER_DOMAIN", "app.urclass.id")
NODE_MAJOR = int(os.environ.get("NODE_MAJOR", "22"))

API = "https://developers.hostinger.com/api/hosting/v1"
SITE = f"{API}/accounts/{USER}/websites/{DOMAIN}"
ARCHIVE = "fe-app.zip"
CTX = ssl.create_default_context()

# Cloudflare fronts the Hostinger API and rejects urllib's default
# User-Agent with error 1010, so every request presents a curl UA.
UA = "curl/8.5.0"


def call(url, method="GET", data=None, headers=None, timeout=300, raw=False):
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("User-Agent", UA)
    req.add_header("Accept", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=timeout) as r:
            body = r.read()
            if raw:
                return r.status, body, dict(r.headers)
            return r.status, (json.loads(body) if body else {}), dict(r.headers)
    except urllib.error.HTTPError as e:
        # Must come first: HTTPError subclasses URLError.
        detail = e.read().decode(errors="replace")[:400]
        return e.code, {"error": detail}, dict(e.headers)
    except (urllib.error.URLError, OSError, TimeoutError) as e:
        # A refused or unreachable host used to escape as a traceback, which
        # made a transient network blip look like a deploy bug and skipped the
        # retry entirely. Reported as status 0 so callers can retry it.
        payload = {"error": f"network: {e}"}
        return 0, (b"" if raw else payload), {}


def authed(url, method="GET", data=None, **kw):
    hdrs = {"Authorization": f"Bearer {TOKEN}"}
    if data is not None:
        hdrs["Content-Type"] = "application/json"
    return call(url, method, data, hdrs, **kw)


def build_archive():
    files = subprocess.run(["git", "ls-files"], capture_output=True,
                           text=True, check=True).stdout.split("\n")
    files = [f for f in files if f and os.path.isfile(f)]

    with open(".env.production", "w", encoding="utf-8", newline="\n") as fh:
        fh.write(ENV_BODY.rstrip("\n") + "\n")
    os.chmod(".env.production", 0o600)
    files.append(".env.production")

    if os.path.exists(ARCHIVE):
        os.remove(ARCHIVE)
    with zipfile.ZipFile(ARCHIVE, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in files:
            z.write(f, f)

    size = os.path.getsize(ARCHIVE)
    print(f"archive: {len(files)} files, {size/1048576:.2f} MB")
    # git ls-files honours .gitignore, so node_modules/.next/.git are absent
    # by construction. Assert it anyway - shipping them breaks the build.
    with zipfile.ZipFile(ARCHIVE) as z:
        names = z.namelist()
    for bad in ("node_modules/", ".next/", ".git/"):
        if any(n.startswith(bad) for n in names):
            print(f"refusing to upload: archive contains {bad}")
            sys.exit(1)
    for need in ("package.json", ".env.production"):
        if need not in names:
            print(f"refusing to upload: archive is missing {need}")
            sys.exit(1)
    return size


def upload_once(size):
    """One full attempt. Returns None on success or a reason string."""
    st, d, _ = authed(f"{API}/files/upload-urls", "POST",
                      json.dumps({"username": USER, "domain": DOMAIN}).encode())
    if st != 200:
        return f"cannot get an upload url (HTTP {st}): {d}"

    d = d.get("data", d)

    # The API can answer 200 with an incomplete body: one deploy died on
    # ValueError: unknown url type: '/fe-app.zip?override=true', which is what
    # an empty "url" produces. Treat it as a failed attempt so the retry loop
    # fetches fresh credentials instead of crashing.
    host = str(d.get("url") or "").strip()
    if not host.startswith(("http://", "https://")):
        return f"upload url missing or relative in the response: {host!r}"
    for key in ("auth_key", "rest_auth_key"):
        if not d.get(key):
            return f"upload response has no {key}"

    target = f"{host.rstrip('/')}/{ARCHIVE}?override=true"
    tus = {"X-Auth": d["auth_key"], "X-Auth-Rest": d["rest_auth_key"],
           "Tus-Resumable": "1.0.0"}

    st, body, _ = call(target, "POST", None,
                       {**tus, "Upload-Length": str(size), "Upload-Offset": "0"},
                       raw=True)
    if st not in (200, 201):
        return f"create upload failed (HTTP {st}): {body[:200]}"

    with open(ARCHIVE, "rb") as fh:
        payload = fh.read()
    st, body, hdrs = call(target, "PATCH", payload, {
        **tus, "Content-Type": "application/offset+octet-stream",
        "Upload-Offset": "0"}, raw=True)
    off = hdrs.get("Upload-Offset") or hdrs.get("upload-offset")
    if st not in (200, 204) or (off and int(off) != size):
        return f"send failed (HTTP {st}, offset {off} of {size}): {body[:200]}"

    print(f"uploaded {off or size} bytes")
    return None


def upload(size):
    """Retry the whole sequence, credentials included.

    The upload host is IPv4-only on a single address that drops connections
    intermittently - a deploy died on "[Errno 101] Network is unreachable"
    while the two before it, same script, went through. One refused connection
    is not a reason to fail a deploy.

    Credentials are re-fetched per attempt rather than reused: a half-finished
    TUS session cannot be resumed from offset 0.
    """
    attempts = 4
    for attempt in range(1, attempts + 1):
        reason = upload_once(size)
        if reason is None:
            return
        print(f"attempt {attempt}/{attempts} failed: {reason}")
        if attempt < attempts:
            wait = 15 * attempt
            print(f"  retrying in {wait}s")
            time.sleep(wait)

    print("upload failed after every attempt")
    sys.exit(1)


def start_build():
    body = {
        "node_version": NODE_MAJOR,
        "app_type": "next",
        "root_directory": "",
        "output_directory": ".next",
        "build_script": "build",
        "package_manager": "npm",
        "source_type": "archive",
        "source_options": {"archive_path": ARCHIVE},
    }
    st, d, _ = authed(f"{SITE}/nodejs/builds", "POST", json.dumps(body).encode())
    if st != 200 or "uuid" not in d:
        print(f"cannot start the build (HTTP {st}): {d}")
        sys.exit(1)
    print(f"build {d['uuid']} state={d['state']}")
    return d["uuid"]


def watch(uuid):
    shown = 0
    last_state = None
    for _ in range(150):  # ~25 min at 10s
        st, d, _ = authed(f"{SITE}/nodejs/builds?per_page=10")
        state = None
        if st == 200:
            for b in d.get("data", []):
                if b.get("uuid") == uuid:
                    state = b.get("state")
        if state != last_state:
            print(f"[state] {state}")
            last_state = state

        st, d, _ = authed(f"{SITE}/nodejs/builds/{uuid}/logs")
        if st == 200 and isinstance(d.get("logs"), str):
            text = d["logs"]
            if len(text) > shown:
                sys.stdout.write(text[shown:])
                sys.stdout.flush()
                shown = len(text)

        if state in ("completed", "failed"):
            print(f"\nbuild finished: {state}")
            return 0 if state == "completed" else 1
        time.sleep(10)
    print("timed out waiting for the build")
    return 1


def main():
    if not TOKEN:
        print("HOSTINGER_API_TOKEN is not set")
        return 2
    if not USER:
        print("HOSTINGER_USERNAME is not set")
        return 2
    if not ENV_BODY.strip():
        print("FE_ENV_PRODUCTION is not set - refusing to build without env")
        return 2
    print(f"target: {DOMAIN} (node {NODE_MAJOR})")
    size = build_archive()
    upload(size)
    return watch(start_build())


if __name__ == "__main__":
    sys.exit(main())
