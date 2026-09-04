"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Maximize2, Minus, Plus, Users } from "lucide-react";
import {
  useAiLive,
  type LiveNode,
  type LiveRequest,
  type NodeState,
} from "@/http/ai/admin-ai-live";
import { compactNumber, fullNumber } from "@/lib/format-usage";

/**
 * Siapa yang sedang memakai asisten AI, sekarang.
 *
 * Digambar sebagai peta node - satu node per pengguna, mengelilingi satu pusat -
 * karena bentuk itu menjawabnya dalam sekali lihat: yang ramai terlihat dari
 * jumlah garis yang menyala, bukan dari membaca angka baris per baris.
 *
 * **Tanpa filter periode, dan itu inti dari halaman ini.** Node hidup satu menit
 * sejak permintaan terakhirnya lalu hilang sendiri. Jendela yang bisa disetel
 * membuat peta berangsur penuh oleh orang yang sudah lama berhenti memakai, dan
 * peta seperti itu tidak lagi menjawab pertanyaan yang jadi alasannya ada.
 * Batasnya ditentukan server, jadi tidak ada cara memintanya lebih panjang.
 *
 * Yang perlu jujur disebut: hanya status **menunggu jawaban** yang benar-benar
 * "sekarang" - itu dicatat saat permintaan dimulai. `active` berarti permintaan
 * terakhirnya selesai kurang dari satu menit lalu.
 */

const RUPA: Record<NodeState, { titik: string; garis: string; tepi: string }> =
  {
    waiting: {
      titik: "bg-orange-500",
      // Oranye untuk lalu lintas yang sedang berjalan - satu-satunya hal di peta
      // ini yang perlu menarik mata.
      garis: "#ea6a1f",
      tepi: "border-orange-300 bg-orange-50",
    },
    active: {
      titik: "bg-sky-500",
      garis: "#9aa3ad",
      tepi: "border-slate-200 bg-white",
    },
  };

/** Kapasitas cincin pertama. Lebih dari ini, node dipindah ke cincin kedua. */
const CINCIN_PERTAMA = 8;

/**
 * Batas dan langkah zoom.
 *
 * Bawah 0,6 supaya banyak node bisa dilihat sekaligus saat labelnya mulai
 * berdempet; atas 2 supaya nama yang terpotong bisa dibaca. Lebih dari itu tidak
 * menambah apa pun - pada 3x yang terlihat cuma satu node dan sepotong garis.
 */
const ZOOM_MIN = 0.6;
const ZOOM_MAKS = 2;
const ZOOM_LANGKAH = 0.2;

export default function AiLiveUsage() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const { data, isPending } = useAiLive({ token });

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border bg-white py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat pemakaian langsung...
      </div>
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_17rem]">
      <PetaNode nodes={data.nodes} ttl={data.node_ttl_minutes} />
      <TabelTerakhir recent={data.recent} />
    </div>
  );
}

/**
 * Peta node: satu pusat, pengguna mengelilinginya.
 *
 * Digambar di ruang koordinat tetap lalu diskalakan lewat viewBox, bukan diukur
 * dari lebar elemen sebenarnya. Alasannya: mengukur elemen berarti membaca tata
 * letak saat render - yang mengembalikan nol pada render pertama dan memaksa
 * satu putaran render kedua hanya untuk menempatkan node.
 *
 * Delapan pertama di cincin dalam; sisanya di cincin luar, karena dua belas node
 * pada satu cincin membuat labelnya bertumpuk dan justru tidak terbaca.
 */
function PetaNode({ nodes, ttl }: { nodes: LiveNode[]; ttl: number }) {
  const [zoom, setZoom] = useState(1);

  const ubahZoom = (delta: number) =>
    // Dibulatkan ke dua desimal: penjumlahan float berulang menghasilkan
    // 1.0000000000000002, dan angka itu ikut muncul di label persennya.
    setZoom(
      (prev) =>
        Math.round(
          Math.min(ZOOM_MAKS, Math.max(ZOOM_MIN, prev + delta)) * 100,
        ) / 100,
    );

  const LEBAR = 1000;
  const TINGGI = 460;
  const PX = LEBAR / 2;
  const PY = TINGGI / 2;

  const titik = nodes.map((node, index) => {
    const diLuar = index >= CINCIN_PERTAMA;
    const jumlah = diLuar
      ? Math.max(1, nodes.length - CINCIN_PERTAMA)
      : Math.min(nodes.length, CINCIN_PERTAMA);
    const ke = diLuar ? index - CINCIN_PERTAMA : index;

    // Cincin luar digeser setengah langkah supaya node-nya tidak berbaris tepat
    // di belakang node cincin dalam.
    const sudut =
      (ke / jumlah) * Math.PI * 2 -
      Math.PI / 2 +
      (diLuar ? Math.PI / jumlah : 0);

    return {
      node,
      x: PX + Math.cos(sudut) * (diLuar ? 410 : 260),
      y: PY + Math.sin(sudut) * (diLuar ? 185 : 120),
    };
  });

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Pemakaian langsung
        </p>
        <span className="ml-auto hidden text-[11px] text-slate-400 sm:inline">
          node hilang setelah {ttl} menit tak aktif
        </span>

        {/* Kontrol zoom di kepala panel, bukan melayang di atas gambar: node bisa
            berada di mana saja pada peta, dan tombol yang melayang akan menutupi
            salah satunya cepat atau lambat. */}
        <div className="ml-auto flex items-center gap-0.5 sm:ml-3">
          <button
            type="button"
            onClick={() => ubahZoom(-ZOOM_LANGKAH)}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Perkecil peta"
            title="Perkecil"
            className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Minus className="size-3.5" />
          </button>

          {/* Angka persennya sekalian jadi tombol kembali ke 100% - satu kontrol
              yang memberi tahu keadaan dan sekaligus memulihkannya. */}
          <button
            type="button"
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            aria-label="Kembalikan ukuran peta"
            title="Kembalikan ukuran"
            className="flex h-6 min-w-11 items-center justify-center rounded-md px-1 text-[11px] font-bold tabular-nums text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {zoom === 1 ? (
              <Maximize2 className="size-3" />
            ) : (
              <span>{Math.round(zoom * 100)}%</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => ubahZoom(ZOOM_LANGKAH)}
            disabled={zoom >= ZOOM_MAKS}
            aria-label="Perbesar peta"
            title="Perbesar"
            className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Kisi latar. Memberi skala tanpa menambah satu pun elemen yang harus
          dibaca. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 top-10 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(#e1e0d9 1px, transparent 1px), linear-gradient(90deg, #e1e0d9 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {nodes.length === 0 ? (
        <div className="relative flex h-52 flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <Users className="size-5 text-slate-300" />
          Tidak ada yang memakai asisten saat ini.
        </div>
      ) : (
        <div className="relative h-64 overflow-hidden sm:h-72">
          {/*
           * Diskalakan dari tengah, dan yang di luar bingkai dipotong.
           *
           * Titik tumpunya di tengah karena di situlah hub-nya: memperbesar
           * berarti ingin membaca yang di sekitar pusat, dan itu yang ikut
           * membesar. Tanpa panning - pada 200%, node cincin luar memang keluar
           * bingkai, dan yang dilakukan orang untuk melihatnya adalah
           * mengecilkan lagi, bukan menggeser.
           */}
          <div
            className="absolute inset-0 transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <svg
              viewBox={`0 0 ${LEBAR} ${TINGGI}`}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 size-full"
              aria-hidden
            >
              {titik.map(({ node, x, y }) => {
                const rupa = RUPA[node.state];
                const menunggu = node.state === "waiting";

                // Lengkung, bukan garis lurus: garis lurus dari pusat ke delapan
                // arah terbaca sebagai roda sepeda, dan lengkung membuat tiap
                // sambungan bisa diikuti mata satu per satu.
                const kx = (PX + x) / 2 + (y - PY) * 0.12;
                const ky = (PY + y) / 2 - (x - PX) * 0.12;

                return (
                  <path
                    key={node.user_id}
                    d={`M ${x} ${y} Q ${kx} ${ky} ${PX} ${PY}`}
                    fill="none"
                    stroke={rupa.garis}
                    strokeWidth={menunggu ? 2.5 : 1.5}
                    strokeLinecap="round"
                    opacity={menunggu ? 1 : 0.55}
                    className={menunggu ? "aliran-node" : undefined}
                  />
                );
              })}
            </svg>

            {/* Pusat. Diberi nama aplikasinya, bukan "server" atau "AI": yang
              dipetakan adalah pemakaian di UrClass, dan providernya bisa
              berganti tanpa mengubah apa pun di gambar ini. */}
            <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-2.5 py-1.5 shadow-sm">
              <span className="flex size-4 shrink-0 items-center justify-center rounded bg-orange-500 text-[10px] font-bold text-white">
                U
              </span>
              <span className="text-xs font-bold text-orange-900">
                Kak UrClass
              </span>
            </div>

            {titik.map(({ node, x, y }) => (
              <NodeChip
                key={node.user_id}
                node={node}
                kiri={(x / LEBAR) * 100}
                atas={(y / TINGGI) * 100}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NodeChip({
  node,
  kiri,
  atas,
}: {
  node: LiveNode;
  kiri: number;
  atas: number;
}) {
  const rupa = RUPA[node.state];
  const menunggu = node.state === "waiting";

  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${kiri}%`, top: `${atas}%` }}
    >
      <div
        className={`relative flex max-w-[10rem] items-center gap-1.5 rounded-lg border px-2 py-1 shadow-sm ${rupa.tepi}`}
        title={node.email ? `${node.name} · ${node.email}` : node.name}
      >
        {menunggu && (
          <span
            aria-hidden
            className="denyut-node absolute inset-0 rounded-lg border border-orange-400"
          />
        )}

        <span className={`size-1.5 shrink-0 rounded-full ${rupa.titik}`} />

        <span className="min-w-0">
          <span className="block truncate text-[11px] font-bold leading-tight text-slate-900">
            {node.name}
          </span>
          <span className="block truncate text-[10px] leading-tight tabular-nums text-slate-500">
            {menunggu && node.waiting_seconds !== null
              ? `menunggu ${node.waiting_seconds} dtk`
              : `${node.requests} req · ${compactNumber(node.total_tokens)} tok`}
            {node.failed > 0 && (
              <span className="text-red-600"> · {node.failed} gagal</span>
            )}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Permintaan terakhir, dikenali dari penggunanya.
 *
 * Kolom pertamanya nama orang, bukan nama model: model di UrClass hampir selalu
 * satu dan sama, jadi mengelompokkannya per model tidak memisahkan apa pun -
 * sementara "permintaan yang baru masuk itu dari siapa" justru pertanyaan yang
 * dijawab halaman ini.
 *
 * Tidak mengikuti umur node yang satu menit itu: daftar ini justru dibaca ketika
 * tidak ada lalu lintas sama sekali, saat yang dicari adalah permintaan terakhir
 * yang masuk - dari siapa pun dan kapan pun itu.
 */
function TabelTerakhir({ recent }: { recent: LiveRequest[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <p className="border-b px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Permintaan terakhir
      </p>

      {recent.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-slate-400">
          Belum ada permintaan.
        </p>
      ) : (
        <div className="divide-y">
          {recent.map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-1.5">
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  item.status === "ok" ? "bg-emerald-500" : "bg-red-500"
                }`}
                title={item.status}
              />

              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700">
                {item.name}
              </span>

              <span className="shrink-0 text-right text-[10px] tabular-nums">
                <span
                  className="text-orange-600"
                  title={`${fullNumber(item.input_tokens)} token masuk`}
                >
                  {compactNumber(item.input_tokens)}↑
                </span>{" "}
                <span
                  className="text-emerald-600"
                  title={`${fullNumber(item.output_tokens)} token keluar`}
                >
                  {compactNumber(item.output_tokens)}↓
                </span>
              </span>

              <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-slate-400">
                {item.seconds_ago !== null ? jarak(item.seconds_ago) : "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Jarak waktu dalam satuan yang paling dekat, tanpa membulatkan ke "0 menit". */
function jarak(detik: number): string {
  if (detik < 60) return `${detik}d`;

  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit}m`;

  const jam = Math.floor(menit / 60);

  return jam < 24 ? `${jam}j` : `${Math.floor(jam / 24)}h`;
}
