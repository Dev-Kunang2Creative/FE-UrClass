import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Public Dapodik mirror (github.com/wanrabbae/api-sekolah-indonesia). It is a
 * third-party service with no auth, so it is called directly instead of going
 * through `api`, which carries our own base URL and bearer token.
 */
const SEKOLAH_API_URL =
  process.env.NEXT_PUBLIC_SEKOLAH_API_URL ||
  "https://api-sekolah-indonesia.vercel.app";

/** Fewer than this and the endpoint answers with half of Indonesia. */
export const SEKOLAH_SEARCH_MIN_LENGTH = 3;

export interface SekolahOption {
  id: string;
  npsn: string;
  /** Uppercased in the source data, e.g. "SMAN 1 SURABAYA". */
  sekolah: string;
  /** "SMA", "SMK", "MA", ... */
  bentuk: string;
  /** Prefixed in the source data, e.g. "Prov. Jawa Timur". */
  propinsi: string;
  /** e.g. "Kota Surabaya", "Kab. Lebak". */
  kabupaten_kota: string;
  kecamatan: string;
}

interface SekolahResponse {
  status: "success" | "failed";
  dataSekolah: SekolahOption[];
  total_data?: number;
}

/**
 * "Prov. Jawa Timur" is how Dapodik writes it, not how a person does.
 *
 * Dua provinsi ditulis Dapodik dengan titik-titik - "D.K.I. Jakarta" dan
 * "D.I. Yogyakarta" - sementara daftar wilayah di lib/wilayah.ts memakai ejaan
 * tanpa titik. Diseragamkan di sini supaya nilai hasil isi otomatis dari
 * sekolah sama persis dengan pilihan di dropdown provinsi, bukan dianggap
 * ketikan bebas yang kebetulan mirip.
 */
export const cleanPropinsi = (value: string) =>
  value
    .replace(/^Prov\.\s*/i, "")
    .replace(/^D\.K\.I\.\s*/i, "DKI ")
    .replace(/^D\.I\.\s*/i, "DI ")
    .trim();

/** Kept whole: "Kota Surabaya" and "Kab. Sidoarjo" are different places. */
export const cleanKabupatenKota = (value: string) => value.trim();

/**
 * School lookup for the "asal sekolah" field.
 *
 * The dataset is large but not complete, and the service is a free Vercel
 * deployment that can be slow or down, so the picker built on this must keep
 * accepting a typed name - a student cannot be blocked from finishing their
 * profile because someone else's API is unreachable.
 */
export const useSearchSekolah = ({
  search,
  enabled = true,
}: {
  search: string;
  enabled?: boolean;
}) => {
  const term = search.trim();

  return useQuery({
    queryKey: ["sekolah", term],
    enabled: enabled && term.length >= SEKOLAH_SEARCH_MIN_LENGTH,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const { data } = await axios.get<SekolahResponse>(
        `${SEKOLAH_API_URL}/sekolah/s`,
        {
          params: { sekolah: term, page: 1, perPage: 20 },
          timeout: 15000,
        },
      );
      // A miss answers 200 with status "failed" and an empty list.
      return data.status === "success" ? (data.dataSekolah ?? []) : [];
    },
  });
};
