import Image from "next/image";

/**
 * The UrClass mascot, per the brand guide: a study companion, friendly and
 * always positive.
 *
 * The sources arrived as 1-1.8MB PNGs, about 20MB for the set. They are
 * committed as trimmed WebP instead - 851KB for all fourteen - because the
 * transparent margin around each figure was padding the layout could not see,
 * and the frontend is deployed as a zip over an upload API that has been
 * failing intermittently.
 *
 * Intrinsic sizes are recorded here so next/image can reserve the space and
 * nothing shifts as the file arrives. Every pose has its own aspect ratio, a
 * consequence of trimming each one to its own figure.
 */
export const MASCOT_POSES = {
  ayobelajar: { w: 594, h: 720, alt: "Maskot UrClass mengajak belajar" },
  berfikir: { w: 478, h: 720, alt: "Maskot UrClass sedang berpikir" },
  buku1: { w: 446, h: 720, alt: "Maskot UrClass membaca buku" },
  hai: { w: 484, h: 720, alt: "Maskot UrClass menyapa" },
  kecewa: { w: 528, h: 720, alt: "Maskot UrClass kecewa" },
  laptop: { w: 499, h: 720, alt: "Maskot UrClass di depan laptop" },
  lulus: { w: 470, h: 720, alt: "Maskot UrClass memakai toga" },
  marah: { w: 489, h: 720, alt: "Maskot UrClass kesal" },
  semangat: { w: 512, h: 720, alt: "Maskot UrClass memberi semangat" },
  sip1: { w: 518, h: 720, alt: "Maskot UrClass mengangkat jempol" },
  sip2: { w: 720, h: 717, alt: "Maskot UrClass mengangkat jempol" },
  terimakasih1: { w: 490, h: 720, alt: "Maskot UrClass mengucapkan terima kasih" },
  terimakasih2: { w: 536, h: 720, alt: "Maskot UrClass mengucapkan terima kasih" },
  yay: { w: 491, h: 720, alt: "Maskot UrClass bersorak" },
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;

interface MascotProps {
  pose: MascotPose;
  /** Rendered size and placement. Height usually decides; width follows. */
  className?: string;
  /** Override when the pose carries meaning the surrounding text does not. */
  alt?: string;
  /** Decorative: hidden from assistive tech, for watermarks and backdrops. */
  decorative?: boolean;
  sizes?: string;
}

export default function Mascot({
  pose,
  className = "",
  alt,
  decorative = false,
  sizes = "200px",
}: MascotProps) {
  const meta = MASCOT_POSES[pose];

  return (
    <Image
      src={`/images/mascot/${pose}.webp`}
      alt={decorative ? "" : (alt ?? meta.alt)}
      width={meta.w}
      height={meta.h}
      sizes={sizes}
      aria-hidden={decorative || undefined}
      className={className}
    />
  );
}
