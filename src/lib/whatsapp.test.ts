/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";


import { buatTautanWhatsApp } from "./whatsapp.ts";

test("tautan WhatsApp menormalkan format nomor Indonesia", () => {
  assert.equal(
    buatTautanWhatsApp("0812 3456-7890"),
    "https://wa.me/6281234567890",
  );
});

test("tautan WhatsApp menolak karakter selain nomor pada URL", () => {
  assert.equal(
    buatTautanWhatsApp("+62 (812) 3456 7890"),
    "https://wa.me/6281234567890",
  );
});
