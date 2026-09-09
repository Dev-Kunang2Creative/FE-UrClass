"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Menampilkan teks bertahap, seolah sedang diketik.
 *
 * **Yang perlu jujur disebut:** provider yang dipakai tidak streaming, jadi
 * jawabannya sudah tiba utuh sebelum animasi ini mulai. Ini pengungkapan
 * bertahap atas teks yang sudah ada - bukan token yang datang satu-satu.
 * Gunanya nyata (jawaban panjang tidak muncul sebagai dinding teks sekaligus,
 * dan mata punya waktu mengikuti), tapi ia tidak mencerminkan kecepatan
 * generasi sebenarnya.
 *
 * Kalau nanti pindah ke jalur streaming sungguhan, komponen ini yang dibuang -
 * bukan dijadikan pembungkus stream, karena dua sumber laju yang bersaing
 * menghasilkan teks yang tersendat.
 *
 * Diungkap per potongan, bukan per karakter: satu render per karakter membuat
 * jawaban 2.000 karakter melakukan 2.000 render, dan itu terasa sebagai lag di
 * ponsel kelas menengah.
 */

/** Karakter per langkah dan jeda antar langkah. */
const CHUNK = 3;
const INTERVAL_MS = 12;

export function useTypewriter(text: string, enabled: boolean, onDone?: () => void) {
  // Nilai awal langsung benar, jadi effect di bawah tidak perlu menyetel state
  // secara sinkron - pola yang eslint tolak (react-hooks/set-state-in-effect)
  // dan yang membuat render pertama menampilkan keadaan yang salah lalu
  // menimpanya.
  //
  // Ini sah karena `text` tetap untuk satu pesan: daftar pesan hanya bertambah
  // di ujung, jadi pesan pada indeks tertentu tidak pernah berganti isi.
  const [shown, setShown] = useState(enabled ? 0 : text.length);
  const frame = useRef<ReturnType<typeof setInterval> | null>(null);

  // onDone disimpan di ref supaya effect animasi tidak perlu memasukkannya ke
  // daftar dependensi - callback yang lahir baru setiap render akan membuat
  // animasinya mulai ulang di tiap render.
  //
  // Ref-nya disegarkan lewat effect, bukan saat render: menulis ke ref selama
  // render dilarang React 19 (react-hooks/refs), karena render harus bebas efek
  // samping agar bisa diulang tanpa akibat.
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    frame.current = setInterval(() => {
      setShown((prev) => {
        const next = prev + CHUNK;

        if (next >= text.length) {
          if (frame.current) clearInterval(frame.current);
          // Memberi tahu pemanggil bahwa pesan ini sudah pernah dianimasikan,
          // supaya ia tidak dianimasikan lagi. Tanpa ini, menutup lalu membuka
          // panel membuat setiap jawaban lama mengetik ulang dari nol -
          // komponennya lahir baru, dan tidak ada yang mencatat bahwa
          // animasinya sudah selesai.
          done.current?.();

          return text.length;
        }

        return next;
      });
    }, INTERVAL_MS);

    return () => {
      if (frame.current) clearInterval(frame.current);
    };
  }, [text, enabled]);

  return {
    visible: text.slice(0, shown),
    /** Masih berjalan - dipakai untuk menampilkan kursor dan tombol lewati. */
    typing: enabled && shown < text.length,
    /** Melewati animasi. Ada karena menunggu animasi selesai bukan pilihan
     *  yang harus dipaksakan ke orang yang sudah membaca lebih cepat. */
    skip: () => {
      setShown(text.length);
      done.current?.();
    },
  };
}
