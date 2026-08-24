"use client";

import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  makeUpdateProfileSchema,
  UpdateProfileType,
} from "@/validators/profile/update-profile-validator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { updateProfileApiHandler } from "@/http/profile/update-profile";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, User, GraduationCap, Target } from "lucide-react";
import ReferenceCombobox from "@/components/atoms/combobox/ReferenceCombobox";
import { useSearchPerguruanTinggi } from "@/http/reference/get-perguruan-tinggi";
import { useProgramStudi } from "@/http/reference/get-program-studi";
import { useKategori } from "@/hooks/useKategori";

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

  // A CPNS candidate has no target campus, so the whole section is dropped
  // rather than shown and quietly ignored.
  const showTargets = kategori === "utbk";

  const schema = useMemo(
    () => makeUpdateProfileSchema(showTargets),
    [showTargets],
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
    },
    mode: "onChange",
  });

  // Campus searches, and the ids needed to narrow each major list to the
  // campus it belongs to.
  const [uniSearch1, setUniSearch1] = useState("");
  const [uniSearch2, setUniSearch2] = useState("");
  const [majorSearch1, setMajorSearch1] = useState("");
  const [majorSearch2, setMajorSearch2] = useState("");
  const [uniId1, setUniId1] = useState<string | null>(null);
  const [uniId2, setUniId2] = useState<string | null>(null);

  const uni1 = useSearchPerguruanTinggi({
    search: uniSearch1,
    token,
    enabled: showTargets,
  });
  const uni2 = useSearchPerguruanTinggi({
    search: uniSearch2,
    token,
    enabled: showTargets,
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

  const campusOptions = (list?: { id: string; nama: string; program_studi_count?: number }[]) =>
    (list ?? []).map((item) => ({
      id: item.id,
      label: item.nama,
      hint:
        item.program_studi_count != null
          ? `${item.program_studi_count} program studi`
          : undefined,
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
        description="Dipakai untuk sertifikat dan menghubungi kamu."
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
                <FieldLabel htmlFor="province">Provinsi</FieldLabel>
                <Input {...field} id="province" placeholder="Mis: Jawa Timur" />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="city">Kabupaten / Kota</FieldLabel>
                <Input {...field} id="city" placeholder="Mis: Surabaya" />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </Section>

      <Section icon={GraduationCap} title="Pendidikan">
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
                <FieldLabel htmlFor="school_origin">
                  Asal sekolah <Required />
                </FieldLabel>
                <Input
                  {...field}
                  id="school_origin"
                  placeholder="Mis: SMAN 1 Surabaya"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </Section>

      {showTargets && (
        <Section
          icon={Target}
          title="Target kampus"
          description="Pilih dari daftar PTN, atau ketik sendiri kalau kampusmu belum ada di daftar."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="target_university_1"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Universitas pilihan 1 <Required />
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
                      Jurusan pilihan 1 <Required />
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
                    <FieldLabel>Jurusan pilihan 2</FieldLabel>
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
