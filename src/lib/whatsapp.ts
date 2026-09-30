export function buatTautanWhatsApp(nomor: string): string {
  let angka = nomor.replace(/\D/g, "");

  if (angka.startsWith("00")) angka = angka.slice(2);
  if (angka.startsWith("0")) angka = `62${angka.slice(1)}`;
  if (angka.startsWith("8")) angka = `62${angka}`;

  return `https://wa.me/${angka}`;
}

const NOMOR_WHATSAPP_BAWAAN = "6281805028700";

export const TAUTAN_WHATSAPP_BANTUAN = buatTautanWhatsApp(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || NOMOR_WHATSAPP_BAWAAN,
);
