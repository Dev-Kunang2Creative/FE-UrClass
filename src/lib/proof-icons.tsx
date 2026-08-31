import {
  Camera,
  Instagram,
  Link as LinkIcon,
  MessageCircle,
  Music2,
  Share2,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import type { ProofIcon } from "@/http/proof-requirements/proof-requirements";

/**
 * Ikon dan warna tiap jenis syarat bukti.
 *
 * Dipisah ke sini karena dipakai dua tempat yang tidak saling tahu - pengelola
 * syarat di panel admin dan dialog pendaftaran peserta - dan keduanya harus
 * menampilkan penanda yang sama untuk syarat yang sama.
 *
 * lucide-react tidak punya ikon WhatsApp dan TikTok, jadi keduanya memakai
 * padanan terdekat: gelembung pesan dan not musik.
 */
const MAP: Record<ProofIcon, { Icon: LucideIcon; className: string; label: string }> = {
  instagram: { Icon: Instagram, className: "text-pink-600", label: "Instagram" },
  whatsapp: { Icon: MessageCircle, className: "text-green-600", label: "WhatsApp" },
  tiktok: { Icon: Music2, className: "text-slate-900", label: "TikTok" },
  youtube: { Icon: Youtube, className: "text-red-600", label: "YouTube" },
  share: { Icon: Share2, className: "text-blue-600", label: "Bagikan" },
  users: { Icon: Users, className: "text-violet-600", label: "Tag teman" },
  camera: { Icon: Camera, className: "text-amber-600", label: "Tangkapan layar" },
  link: { Icon: LinkIcon, className: "text-slate-600", label: "Tautan" },
};

/** Bawaan untuk syarat tanpa ikon, atau ikon yang tidak dikenali. */
const FALLBACK = { Icon: Camera, className: "text-slate-500", label: "Lainnya" };

export const proofIconOf = (icon: string | null | undefined) =>
  (icon && MAP[icon as ProofIcon]) || FALLBACK;

export const PROOF_ICON_OPTIONS = Object.entries(MAP).map(([value, meta]) => ({
  value: value as ProofIcon,
  label: meta.label,
  Icon: meta.Icon,
  className: meta.className,
}));
