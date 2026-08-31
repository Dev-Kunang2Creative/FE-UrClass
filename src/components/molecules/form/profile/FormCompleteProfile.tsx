"use client";

import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  makeUpdateProfileSchema,
  UpdateProfileType,
  type CpnsTargetType,
} from "@/validators/profile/update-profile-validator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { updateProfileApiHandler } from "@/http/profile/update-profile";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, User, GraduationCap, Target, Clock } from "lucide-react";
import ReferenceCombobox from "@/components/atoms/combobox/ReferenceCombobox";
import { useSearchPerguruanTinggi } from "@/http/reference/get-perguruan-tinggi";
import { useProgramStudi } from "@/http/reference/get-program-studi";
import {
  useFormasi,
  useFormasiStatus,
  useSearchInstansi,
  type FormasiOption,
  type InstansiOption,
} from "@/http/reference/get-instansi";
import {
  useSearchSekolah,
  cleanPropinsi,
  cleanKabupatenKota,
  SEKOLAH_SEARCH_MIN_LENGTH,
  type SekolahOption,
} from "@/http/reference/get-sekolah";
import { useKategori } from "@/hooks/useKategori";
import { PROVINCES, citiesOf, cityBelongsTo } from "@/lib/wilayah";

interface FormCompleteProfileProps {
  onSuccess: () => void;
  /**
   * "onboarding" is the first-run dialog, where the button reads as moving
   * forward; "edit" is Settings, where it saves. The old shared label said
   * "Lanjut" in both, so editing your phone number offered to continue
   * somewhere.
   */
  mode?: "onboarding" | "edit";
}

/** Field names the server can complain about, mapped onto the form. */
const SERVER_FIELDS: FieldPath<UpdateProfileType>[] = [
  "name",
  "phone_number",
  "school_origin",
  "grade_level",
  "birth_date",
  "gender",
  "province",
  "city",
  "target_university_1",
  "target_major_1",
  "target_university_2",
  "target_major_2",
];

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-2.5 border-b-2 border-dashed border-slate-200 pb-2.5">
        <span className="mt-0.5 rounded-lg border-2 border-slate-900 bg-track-tint p-1.5">
          <Icon className="size-4 text-primary" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black tracking-tight text-slate-900">
            {title}
          </h3>
          {description && (
            <p className="text-xs leading-snug text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Thirteen fields, grouped and honest about what happens when saving fails.
 *
 * The previous version caught a failed save, wrote the unsaved values into the
 * session anyway, and reported "Berhasil masuk!" - so a 422 looked like a
 * success and the profile showed values the database did not have. Because the
 * client schema was looser than the server rules, that 422 was the normal
 * outcome of leaving the birth date blank.
 */
export default function FormCompleteProfile({
  onSuccess,
  mode = "onboarding",
}: FormCompleteProfileProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { kategori } = useKategori();
  const token = session?.access_token || "";

  // Admin tidak pernah mengikuti tryout, jadi tidak ada sertifikat maupun
  // laporan nilai yang memakai data dirinya. Form-nya menyusut jadi satu field
  // yang benar-benar dipakai: namanya.
  const isAdmin = session?.user?.role === "admin";

  const isCpns = kategori === "cpns";

  /**
   * Sub-jalur peserta CPNS, dipilih di form ini.
   *
   * Jalur CPNS melayani dua audiens dengan target berbeda bentuk: pelamar
   * sekolah kedinasan menuju sekolah dan program studi, pelamar CPNS umum
   * menuju instansi dan formasi. Meminta keduanya berarti meminta salah satu
   * diisi asal-asalan, jadi yang muncul hanya yang dipilih.
   */
  const [cpnsTarget, setCpnsTarget] = useState<CpnsTargetType>(
    session?.user?.cpns_target_type === "umum" ? "umum" : "kedinasan",
  );

  // Target berbentuk sekolah + program studi: UTBK memakai PTN, CPNS jalur
  // kedinasan memakai sekolah kedinasan. Bentuknya sama, jadi bagian form dan
  // kolom penyimpanannya juga sama - yang berbeda hanya sumber daftarnya.
  const showTargets =
    !isAdmin && (kategori === "utbk" || (isCpns && cpnsTarget === "kedinasan"));
  const showFormasiTargets = !isAdmin && isCpns && cpnsTarget === "umum";

  /**
   * Rekap formasi diterbitkan SSCASN per periode seleksi, jadi ada masa di mana
   * instansinya sudah diketahui tetapi formasinya belum diumumkan sama sekali.
   * Selama masa itu, menampilkan picker formasi yang kosong tidak bisa
   * dibedakan dari kerusakan - jadi kolomnya diganti pemberitahuan, dan tidak
   * diwajibkan.
   *
   * Statusnya datang dari server dan diturunkan dari datanya sendiri, sehingga
   * begitu admin mengunggah rekapnya kolomnya hidup tanpa perlu deploy.
   */
  const formasiStatus = useFormasiStatus({
    token,
    enabled: showFormasiTargets,
  });

  // Selama statusnya belum diketahui, formasi dianggap belum dibuka. Menganggap
  // sebaliknya berarti picker sempat muncul lalu hilang begitu jawabannya tiba.
  const formasiOpen = formasiStatus.data?.is_open ?? false;
  const periodeFormasi = formasiStatus.data?.periode ?? new Date().getFullYear();

  const schema = useMemo(
    () => makeUpdateProfileSchema(
      kategori === "utbk" && !isAdmin,
      isAdmin,
      isCpns ? cpnsTarget : null,
      formasiOpen,
    ),
    [kategori, isAdmin, isCpns, cpnsTarget, formasiOpen],
  );

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: session?.user?.name || "",
      phone_number: session?.user?.phone_number || "",
      grade_level:
        session?.user?.grade_level === "Gap Year" ? "Gap Year" : "SMA/SMK",
      class_level: session?.user?.grade_level?.includes("Kelas ")
        ? `Kelas ${session?.user?.grade_level?.split("Kelas ")[1]}`
        : "Kelas 12",
      school_origin: session?.user?.school_origin || "",
      gender: session?.user?.gender === "P" ? "P" : "L",
      birth_date: session?.user?.birth_date?.slice(0, 10) || "",
      province: session?.user?.province || "",
      city: session?.user?.city || "",
      target_university_1: session?.user?.target_university_1 || "",
      target_major_1: session?.user?.target_major_1 || "",
      target_university_2: session?.user?.target_university_2 || "",
      target_major_2: session?.user?.target_major_2 || "",
      cpns_target_type: session?.user?.cpns_target_type ?? undefined,
      target_instansi_1: session?.user?.target_instansi_1 || "",
      target_formasi_1: session?.user?.target_formasi_1 || "",
      target_instansi_2: session?.user?.target_instansi_2 || "",
      target_formasi_2: session?.user?.target_formasi_2 || "",
    },
    mode: "onChange",
  });

  // Campus searches, and the ids needed to narrow each major list to the
  // campus it belongs to.
  const [schoolSearch, setSchoolSearch] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [uniSearch1, setUniSearch1] = useState("");
  const [uniSearch2, setUniSearch2] = useState("");
  const [majorSearch1, setMajorSearch1] = useState("");
  const [majorSearch2, setMajorSearch2] = useState("");
  const [uniId1, setUniId1] = useState<string | null>(null);
  const [uniId2, setUniId2] = useState<string | null>(null);
  const [instansiSearch1, setInstansiSearch1] = useState("");
  const [instansiSearch2, setInstansiSearch2] = useState("");
  const [formasiSearch1, setFormasiSearch1] = useState("");
  const [formasiSearch2, setFormasiSearch2] = useState("");
  const [instansiId1, setInstansiId1] = useState<string | null>(null);
  const [instansiId2, setInstansiId2] = useState<string | null>(null);

  const schools = useSearchSekolah({ search: schoolSearch });

  const instansi1 = useSearchInstansi({
    search: instansiSearch1,
    token,
    enabled: showFormasiTargets,
  });
  const instansi2 = useSearchInstansi({
    search: instansiSearch2,
    token,
    enabled: showFormasiTargets,
  });
  // Instansi belum dipilih berarti mencari lintas instansi, supaya peserta yang
  // hanya tahu nama jabatannya tetap bisa mulai dari sana.
  const formasi1 = useFormasi({
    instansiId: instansiId1,
    search: formasiSearch1,
    token,
    enabled: showFormasiTargets && formasiOpen,
  });
  const formasi2 = useFormasi({
    instansiId: instansiId2,
    search: formasiSearch2,
    token,
    enabled: showFormasiTargets && formasiOpen,
  });

  const uni1 = useSearchPerguruanTinggi({
    search: uniSearch1,
    token,
    enabled: showTargets,
    jenis: isCpns ? "kedinasan" : "ptn",
  });
  const uni2 = useSearchPerguruanTinggi({
    search: uniSearch2,
    token,
    enabled: showTargets,
    jenis: isCpns ? "kedinasan" : "ptn",
  });
  const major1 = useProgramStudi({
    perguruanTinggiId: uniId1,
    search: majorSearch1,
    token,
  });
  const major2 = useProgramStudi({
    perguruanTinggiId: uniId2,
    search: majorSearch2,
    token,
  });

  // Daftar wilayah statis, jadi penyaringannya di sini - tidak ada permintaan
  // jaringan yang perlu ditunggu. Dibatasi 50 baris supaya popover tidak
  // merender 514 kabupaten sekaligus saat kolomnya masih kosong.
  const wilayahOptions = (list: string[], search: string) => {
    const term = search.trim().toLowerCase();

    return list
      .filter((item) => !term || item.toLowerCase().includes(term))
      .slice(0, 50)
      .map((item) => ({ id: item, label: item }));
  };

  // Two schools can share a name across provinces, so the town is the hint
  // that tells them apart in the list.
  const schoolOptions = (list?: SekolahOption[]) =>
    (list ?? []).map((item) => ({
      id: item.id,
      label: item.sekolah,
      hint: `${item.bentuk} - ${cleanKabupatenKota(item.kabupaten_kota)}, ${cleanPropinsi(item.propinsi)}`,
    }));

  const campusOptions = (list?: { id: string; nama: string; program_studi_count?: number }[]) =>
    (list ?? []).map((item) => ({
      id: item.id,
      label: item.nama,
      hint:
        item.program_studi_count != null
          ? `${item.program_studi_count} program studi`
          : undefined,
    }));

  const instansiOptions = (list?: InstansiOption[]) =>
    (list ?? []).map((item) => ({
      id: item.id,
      label: item.nama,
      hint:
        item.formasi_count != null
          ? `${item.formasi_count} formasi`
          : item.tingkat === "daerah"
            ? "Pemerintah daerah"
            : "Pemerintah pusat",
    }));

  // Nama instansi jadi hint ketika daftarnya lintas instansi, supaya formasi
  // bernama sama di dua instansi bisa dibedakan.
  const formasiOptions = (list?: FormasiOption[]) =>
    (list ?? []).map((item) => ({
      id: item.id,
      label: item.nama,
      hint: [item.jenjang, item.instansi?.nama].filter(Boolean).join(" - ") || undefined,
    }));

  const majorOptions = (
    list?: { id: string; nama: string; jenjang: string | null }[],
  ) =>
    (list ?? []).map((item) => ({
      id: item.id,
      label: item.nama,
      hint: item.jenjang ?? undefined,
    }));

  const onSubmit = async (body: UpdateProfileType) => {
    if (!session?.access_token) {
      toast.error("Sesi kamu sudah berakhir. Masuk ulang untuk menyimpan.");
      return;
    }

    setIsLoading(true);

    try {
      await updateProfileApiHandler(session.access_token, body);

      // No argument on purpose. The session callback refetches /auth/me, and
      // the server has already accepted the write, so it returns exactly what
      // was stored. Passing the values instead wrote them into
      // token.userOverrides, which is merged over the backend response - so an
      // edit made anywhere else would have been shadowed by this token.
      await update();

      toast.success(
        mode === "edit" ? "Profil tersimpan." : "Profil berhasil dilengkapi!",
      );
      onSuccess();
    } catch (error: unknown) {
      // Say what happened and keep the values on screen. Field-level messages
      // from the server land on the fields they belong to.
      const response = (
        error as {
          response?: {
            data?: { errors?: Record<string, string[]>; message?: string };
          };
        }
      )?.response;
      const errors = response?.data?.errors;
      let placed = 0;

      if (errors) {
        for (const field of SERVER_FIELDS) {
          const message = errors[field]?.[0];
          if (message) {
            form.setError(field, { type: "server", message });
            placed += 1;
          }
        }
      }

      toast.error(
        placed > 0
          ? "Ada data yang belum sesuai. Periksa kolom yang ditandai."
          : response?.data?.message || "Gagal menyimpan profil. Coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isGapYear = form.watch("grade_level") === "Gap Year";

  return (
    <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)}>
      <Section
        icon={User}
        title="Data diri"
        description={
          isAdmin
            ? "Nama yang tampil di panel admin."
            : "Dipakai untuk sertifikat dan menghubungi kamu."
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">
                  Nama lengkap <Required />
                </FieldLabel>
                <Input {...field} id="name" placeholder="Nama sesuai identitas" />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Hanya berarti bagi peserta tryout: nomor HP untuk dihubungi,
              sisanya untuk sertifikat dan laporan nilai. Admin tidak punya
              keduanya. */}
          {!isAdmin && (
            <>
            <Controller
              control={form.control}
              name="phone_number"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone_number">
                    Nomor HP <Required />
                  </FieldLabel>
                  <Input
                    {...field}
                    id="phone_number"
                    inputMode="tel"
                    placeholder="08xxxxxxxxxx"
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Jenis kelamin <Required />
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Laki-laki", value: "L" },
                      { label: "Perempuan", value: "P" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border-2 py-2 text-sm transition-colors ${
                          field.value === option.value
                            ? "border-slate-900 bg-track-tint font-bold text-slate-900"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          className="hidden"
                          onChange={field.onChange}
                          checked={field.value === option.value}
                        />
                        {/* Spelled out. "L" and "P" alone were the only labels. */}
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="birth_date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="birth_date">
                    Tanggal lahir <Required />
                  </FieldLabel>
                  <Input {...field} type="date" id="birth_date" />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="province"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Provinsi</FieldLabel>
                  <ReferenceCombobox
                    value={field.value || ""}
                    onChange={(label) => {
                      field.onChange(label);

                      // Kabupaten yang sudah terisi bisa jadi milik provinsi
                      // lain. Dibersihkan hanya saat provinsinya dipilih
                      // manual - pengisian otomatis dari sekolah menyetel
                      // keduanya sekaligus dan tidak lewat sini.
                      const currentCity = form.getValues("city");
                      if (currentCity && !cityBelongsTo(currentCity, label)) {
                        form.setValue("city", "");
                      }
                    }}
                    options={wilayahOptions(PROVINCES, provinceSearch)}
                    placeholder="Pilih provinsi"
                    searchPlaceholder="Mis: Jawa Timur"
                    freeTextHint="Tidak ada di daftar?"
                    emptyHint="Ketik nama provinsi untuk mencari."
                    onSearchChange={setProvinceSearch}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kabupaten / Kota</FieldLabel>
                  <ReferenceCombobox
                    value={field.value || ""}
                    onChange={field.onChange}
                    // Dipersempit ke provinsi yang dipilih; kalau belum ada,
                    // seluruh 514 kabupaten/kota tetap bisa dicari.
                    options={wilayahOptions(
                      citiesOf(form.watch("province")),
                      citySearch,
                    )}
                    placeholder="Pilih kabupaten / kota"
                    searchPlaceholder="Mis: Surabaya"
                    freeTextHint="Tidak ada di daftar?"
                    emptyHint="Ketik nama kabupaten atau kota untuk mencari."
                    onSearchChange={setCitySearch}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            </>
          )}
        </div>
      </Section>

      {/* Admin tidak punya asal sekolah maupun jenjang. */}
      {!isAdmin && (
        <Section
          icon={GraduationCap}
          title="Pendidikan"
          description="Pilih sekolah dari data Dapodik supaya provinsi dan kota terisi otomatis."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="grade_level"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Jenjang <Required />
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {["SMA/SMK", "Gap Year"].map((level) => (
                      <label
                        key={level}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border-2 py-2 text-sm transition-colors ${
                          field.value === level
                            ? "border-slate-900 bg-track-tint font-bold text-slate-900"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="grade_level"
                          value={level}
                          className="hidden"
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value === "Gap Year") {
                              form.setValue("class_level", "");
                              form.clearErrors("class_level");
                            } else {
                              form.setValue("class_level", "Kelas 12");
                            }
                          }}
                          checked={field.value === level}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {!isGapYear && (
              <Controller
                control={form.control}
                name="class_level"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Kelas <Required />
                    </FieldLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {["Kelas 10", "Kelas 11", "Kelas 12"].map((kls) => (
                        <label
                          key={kls}
                          className={`flex cursor-pointer items-center justify-center rounded-xl border-2 py-2 text-sm transition-colors ${
                            field.value === kls
                              ? "border-slate-900 bg-track-tint font-bold text-slate-900"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="class_level"
                            value={kls}
                            className="hidden"
                            onChange={field.onChange}
                            checked={field.value === kls}
                          />
                          {kls.replace("Kelas ", "")}
                        </label>
                      ))}
                    </div>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}

            <Controller
              control={form.control}
              name="school_origin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                  <FieldLabel>
                    Asal sekolah <Required />
                  </FieldLabel>
                  <ReferenceCombobox
                    value={field.value || ""}
                    onChange={(label, option) => {
                      field.onChange(label);
                      const picked = schools.data?.find(
                        (item) => item.id === option?.id,
                      );
                      // Dapodik already knows where the school is, so picking one
                      // fills the two location fields instead of asking again.
                      if (picked) {
                        form.setValue("province", cleanPropinsi(picked.propinsi), {
                          shouldValidate: true,
                        });
                        form.setValue(
                          "city",
                          cleanKabupatenKota(picked.kabupaten_kota),
                          { shouldValidate: true },
                        );
                      }
                    }}
                    options={schoolOptions(schools.data)}
                    loading={schools.isFetching}
                    placeholder="Cari nama sekolahmu"
                    searchPlaceholder="Mis: SMAN 1 Surabaya"
                    freeTextHint="Sekolahmu belum terdaftar?"
                    emptyHint={`Ketik minimal ${SEKOLAH_SEARCH_MIN_LENGTH} huruf nama sekolah.`}
                    onSearchChange={setSchoolSearch}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </Section>
      )}

      {/* Jalur CPNS melayani dua audiens dengan target berbeda bentuk, jadi
          sub-jalurnya ditanyakan lebih dulu - baru field targetnya menyesuaikan.
          Tanpa ini, salah satu pasangan field pasti terisi asal-asalan. */}
      {isCpns && !isAdmin && (
        <Section
          icon={Target}
          title="Tujuanmu"
          description="Pilih dulu, supaya kolom target di bawah menyesuaikan."
        >
          <Controller
            control={form.control}
            name="cpns_target_type"
            render={({ field }) => (
              <Field>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["kedinasan", "Sekolah Kedinasan", "PKN STAN, IPDN, STIS, dan sejenisnya"],
                      ["umum", "CPNS Umum", "Melamar ke instansi dan formasi"],
                    ] as const
                  ).map(([value, label, hint]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer flex-col gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        cpnsTarget === value
                          ? "border-slate-900 bg-track-tint"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cpns_target_type"
                        value={value}
                        className="hidden"
                        checked={cpnsTarget === value}
                        onChange={() => {
                          setCpnsTarget(value);
                          field.onChange(value);
                        }}
                      />
                      <span
                        className={`text-sm ${
                          cpnsTarget === value
                            ? "font-bold text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-slate-500">{hint}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}
          />
        </Section>
      )}

      {showTargets && (
        <Section
          icon={Target}
          title={isCpns ? "Target sekolah kedinasan" : "Target kampus"}
          description={
            isCpns
              ? "Pilih dari daftar sekolah kedinasan, atau ketik sendiri kalau sekolahmu belum ada di daftar."
              : "Pilih dari daftar PTN, atau ketik sendiri kalau kampusmu belum ada di daftar."
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="target_university_1"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      {isCpns ? "Sekolah kedinasan pilihan 1" : "Universitas pilihan 1"}{" "}
                      <Required />
                    </FieldLabel>
                    <ReferenceCombobox
                      value={field.value ?? ""}
                      onChange={(label, option) => {
                        field.onChange(label);
                        setUniId1(option?.id ?? null);
                        // The stored major belongs to the old campus.
                        form.setValue("target_major_1", "");
                      }}
                      options={campusOptions(uni1.data)}
                      loading={uni1.isFetching}
                      disabled={isLoading}
                      placeholder="Pilih atau ketik universitas"
                      searchPlaceholder="Cari PTN..."
                      freeTextHint="Tidak ada di daftar?"
                      emptyHint="Ketik nama kampus untuk mencari."
                      onSearchChange={setUniSearch1}
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="target_major_1"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      {isCpns ? "Program studi pilihan 1" : "Jurusan pilihan 1"}{" "}
                      <Required />
                    </FieldLabel>
                    <ReferenceCombobox
                      value={field.value ?? ""}
                      onChange={(label) => field.onChange(label)}
                      options={majorOptions(major1.data)}
                      loading={major1.isFetching}
                      disabled={isLoading}
                      placeholder="Pilih atau ketik jurusan"
                      searchPlaceholder="Cari program studi..."
                      freeTextHint="Tidak ada di daftar?"
                      emptyHint={
                        uniId1
                          ? "Ketik nama jurusan untuk mencari."
                          : "Pilih universitas dari daftar dulu, atau ketik jurusannya langsung."
                      }
                      onSearchChange={setMajorSearch1}
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="target_university_2"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Universitas pilihan 2</FieldLabel>
                    <ReferenceCombobox
                      value={field.value ?? ""}
                      onChange={(label, option) => {
                        field.onChange(label);
                        setUniId2(option?.id ?? null);
                        form.setValue("target_major_2", "");
                      }}
                      options={campusOptions(uni2.data)}
                      loading={uni2.isFetching}
                      disabled={isLoading}
                      placeholder="Opsional"
                      searchPlaceholder="Cari PTN..."
                      freeTextHint="Tidak ada di daftar?"
                      emptyHint="Ketik nama kampus untuk mencari."
                      onSearchChange={setUniSearch2}
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="target_major_2"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      {isCpns ? "Program studi pilihan 2" : "Jurusan pilihan 2"}
                    </FieldLabel>
                    <ReferenceCombobox
                      value={field.value ?? ""}
                      onChange={(label) => field.onChange(label)}
                      options={majorOptions(major2.data)}
                      loading={major2.isFetching}
                      disabled={isLoading}
                      placeholder="Opsional"
                      searchPlaceholder="Cari program studi..."
                      freeTextHint="Tidak ada di daftar?"
                      emptyHint={
                        uniId2
                          ? "Ketik nama jurusan untuk mencari."
                          : "Pilih universitas pilihan 2 dulu, atau ketik jurusannya langsung."
                      }
                      onSearchChange={setMajorSearch2}
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Target pelamar CPNS umum: instansi lalu formasi. Dua tingkat, sama
          seperti kampus lalu program studi, jadi komponen picker-nya sama. */}
      {showFormasiTargets && (
        <Section
          icon={Target}
          title="Target instansi & formasi"
          description={
            formasiOpen
              ? "Pilih dari daftar, atau ketik sendiri kalau instansi dan formasimu belum ada."
              : "Pilih instansi tujuanmu dulu. Formasinya bisa diisi nanti."
          }
        >
          <div className="space-y-4">
            {/* Instansinya sudah bisa dipilih, formasinya belum ada. Peserta
                perlu diberi tahu supaya tidak menganggap kolomnya rusak atau
                menunda mengisi profilnya sampai formasi terbit. */}
            {!formasiOpen && (
              <div className="flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-900">
                    Formasi CPNS {periodeFormasi} belum dibuka
                  </p>
                  <p className="text-xs leading-relaxed text-amber-800">
                    Rincian formasi diumumkan resmi per periode seleksi dan
                    belum terbit. Pilih instansi tujuanmu sekarang — begitu
                    formasinya keluar, kolom formasi muncul di sini dan kamu
                    bisa melengkapinya. Stay tune ya!
                  </p>
                </div>
              </div>
            )}
            {(
              [
                {
                  slot: 1 as const,
                  instansiName: "target_instansi_1" as const,
                  formasiName: "target_formasi_1" as const,
                  instansi: instansi1,
                  formasi: formasi1,
                  setInstansiSearch: setInstansiSearch1,
                  setFormasiSearch: setFormasiSearch1,
                  setInstansiId: setInstansiId1,
                  required: true,
                },
                {
                  slot: 2 as const,
                  instansiName: "target_instansi_2" as const,
                  formasiName: "target_formasi_2" as const,
                  instansi: instansi2,
                  formasi: formasi2,
                  setInstansiSearch: setInstansiSearch2,
                  setFormasiSearch: setFormasiSearch2,
                  setInstansiId: setInstansiId2,
                  required: false,
                },
              ]
            ).map((row) => (
              <div
                key={row.slot}
                className={
                  formasiOpen
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                    : "grid grid-cols-1 gap-4"
                }
              >
                <Controller
                  control={form.control}
                  name={row.instansiName}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Instansi pilihan {row.slot} {row.required && <Required />}
                      </FieldLabel>
                      <ReferenceCombobox
                        value={field.value || ""}
                        onChange={(label, option) => {
                          field.onChange(label);
                          // Formasi dipersempit ke instansi yang dipilih. Kalau
                          // instansinya diganti, formasi lama bisa jadi bukan
                          // milik instansi baru - jadi dikosongkan.
                          row.setInstansiId(option?.id ?? null);
                          form.setValue(row.formasiName, "");
                        }}
                        options={instansiOptions(row.instansi.data)}
                        loading={row.instansi.isFetching}
                        placeholder="Pilih atau ketik instansi"
                        searchPlaceholder="Mis: Kementerian Keuangan"
                        freeTextHint="Tidak ada di daftar?"
                        emptyHint="Ketik nama instansi untuk mencari."
                        onSearchChange={row.setInstansiSearch}
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Selama rekapnya belum terbit, kolom ini tidak dirender
                    sama sekali. Menampilkannya dalam keadaan nonaktif hanya
                    menyisakan kolom yang tidak bisa diapa-apakan, dan
                    pemberitahuan di atas sudah menjelaskan sebabnya. */}
                {formasiOpen && (
                <Controller
                  control={form.control}
                  name={row.formasiName}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Formasi pilihan {row.slot} {row.required && <Required />}
                      </FieldLabel>
                      <ReferenceCombobox
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={formasiOptions(row.formasi.data)}
                        loading={row.formasi.isFetching}
                        placeholder="Ketik jabatan yang kamu tuju"
                        searchPlaceholder="Mis: Analis Kebijakan Ahli Pertama"
                        freeTextHint="Pakai jabatan yang kamu tulis"
                        emptyHint="Tulis nama jabatan sesuai pengumuman formasi instansinya."
                        onSearchChange={row.setFormasiSearch}
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="sticky bottom-0 -mx-1 flex flex-col gap-2 border-t-2 border-dashed border-slate-200 bg-white px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          <Required /> wajib diisi
        </p>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full border-2 border-slate-900 font-bold sm:w-auto"
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isLoading
            ? "Menyimpan..."
            : mode === "edit"
              ? "Simpan perubahan"
              : "Lanjut"}
        </Button>
      </div>
    </form>
  );
}

function Required() {
  return (
    <span className="text-red-600" aria-label="wajib">
      *
    </span>
  );
}
