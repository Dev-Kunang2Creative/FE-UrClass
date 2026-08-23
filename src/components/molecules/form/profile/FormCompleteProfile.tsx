"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileType } from "@/validators/profile/update-profile-validator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { updateProfileApiHandler } from "@/http/profile/update-profile";
import { toast } from "sonner";
import { useState } from "react";
import { useSession } from "next-auth/react";
import SchoolSearchCombobox from "@/components/atoms/combobox/SchoolSearchCombobox";

interface FormCompleteProfileProps {
  onSuccess: () => void;
}

export default function FormCompleteProfile({ onSuccess }: FormCompleteProfileProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      phone_number: session?.user?.phone_number || "",
      grade_level: session?.user?.grade_level === 'Gap Year' ? 'Gap Year' : "SMA/SMK",
      class_level: session?.user?.grade_level?.includes('Kelas ') ? `Kelas ${session?.user?.grade_level?.split('Kelas ')[1]}` : "Kelas 12",
      school_origin: session?.user?.school_origin || "",
      gender: session?.user?.gender || "L",
      birth_date: session?.user?.birth_date || "",
      province: session?.user?.province || "",
      city: session?.user?.city || "",
      target_university_1: session?.user?.target_university_1 || "",
      target_major_1: session?.user?.target_major_1 || "",
      target_university_2: session?.user?.target_university_2 || "",
      target_major_2: session?.user?.target_major_2 || "",
    },
    mode: "onChange",
  });

  const onSubmit = async (body: UpdateProfileType) => {
    setIsLoading(true);

    try {
      if (session?.access_token) {
        // Attempt to sync with backend
        await updateProfileApiHandler(session.access_token, body);
        
        // Update local NextAuth session — only pass the fields being edited.
        // Do NOT spread session.user here; that would freeze server-managed fields
        // like ticket_balance into userOverrides and prevent them from updating.
        await update({
          user: {
            name: body.name,
            phone_number: body.phone_number,
            school_origin: body.school_origin,
            grade_level: body.grade_level === 'Gap Year' ? 'Gap Year' : `${body.grade_level} ${body.class_level || ''}`.trim(),
            gender: body.gender,
            birth_date: body.birth_date,
            province: body.province,
            city: body.city,
            target_university_1: body.target_university_1,
            target_major_1: body.target_major_1,
            target_university_2: body.target_university_2,
            target_major_2: body.target_major_2,
          }
        });
      }
      
      toast.success("Profil berhasil dilengkapi!", {
        description: "Selamat datang di UrClass",
      });
      onSuccess();
    } catch (error: unknown) {
      // If it fails on the backend, we still want to let them through to the dashboard
      console.error("Failed to update profile to backend:", error);
      
      // Still update local session so the popup goes away — same safe pattern
      await update({
        user: {
          name: body.name,
          phone_number: body.phone_number,
          school_origin: body.school_origin,
          grade_level: body.grade_level === 'Gap Year' ? 'Gap Year' : `${body.grade_level} ${body.class_level || ''}`.trim(),
          gender: body.gender,
          birth_date: body.birth_date,
          province: body.province,
          city: body.city,
          target_university_1: body.target_university_1,
          target_major_1: body.target_major_1,
          target_university_2: body.target_university_2,
          target_major_2: body.target_major_2,
        }
      });

      toast.success("Berhasil masuk!", {
        description: "Selamat datang di UrClass",
      });
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nama lengkap</FieldLabel>
              <Input
                {...field}
                type="text"
                id="name"
                placeholder="Masukkan Nama"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        
        <Controller
          control={form.control}
          name="phone_number"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nomor Hp</FieldLabel>
              <Input
                {...field}
                type="text"
                id="phone_number"
                placeholder="Masukkan Nomor"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
            control={form.control}
            name="grade_level"
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Jenjang</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                    {['SMA/SMK', 'Gap Year'].map((level) => (
                        <label 
                            key={level}
                            className={`flex items-center justify-center gap-2 border rounded-full py-2 cursor-pointer transition-colors text-xs sm:text-sm ${field.value === level ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input hover:bg-muted text-muted-foreground'}`}
                        >
                            <input 
                                type="radio" 
                                name="grade_level" 
                                value={level} 
                                className="hidden"
                                onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value === 'Gap Year') {
                                        form.setValue('class_level', '');
                                        form.clearErrors('class_level');
                                    } else {
                                        form.setValue('class_level', 'Kelas 12');
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
        </div>

        {form.watch('grade_level') !== 'Gap Year' && (
          <Controller
            control={form.control}
            name="class_level"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Pilih Kelas</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {['Kelas 10', 'Kelas 11', 'Kelas 12'].map((kls) => (
                      <label key={kls} className={`flex items-center justify-center gap-2 border rounded-full py-2 cursor-pointer transition-colors text-xs sm:text-sm ${field.value === kls ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input hover:bg-muted text-muted-foreground'}`}>
                          <input 
                              type="radio" 
                              name="class_level" 
                              value={kls} 
                              className="hidden"
                              onChange={field.onChange}
                              checked={field.value === kls} 
                          />
                          {kls}
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
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Asal Sekolah</FieldLabel>
              <SchoolSearchCombobox
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Jenis Kelamin</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'L', value: 'L' },
                    { label: 'P', value: 'P' }
                  ].map((gender) => (
                    <label 
                      key={gender.value}
                      className={`flex items-center justify-center gap-2 border rounded-xl py-2 cursor-pointer transition-colors text-xs sm:text-sm ${field.value === gender.value ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input hover:bg-muted text-muted-foreground'}`}
                    >
                      <input 
                        type="radio" 
                        name="gender" 
                        value={gender.value} 
                        className="hidden"
                        onChange={field.onChange}
                        checked={field.value === gender.value} 
                      />
                      {gender.label}
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
                <FieldLabel>Tanggal Lahir</FieldLabel>
                <Input
                  {...field}
                  type="date"
                  id="birth_date"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="province"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Provinsi</FieldLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder="Mis: Jawa Timur"
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
                <FieldLabel>Kabupaten/Kota</FieldLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder="Mis: Surabaya"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Target Pilihan 1 */}
        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Target Pilihan 1 (Utama)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="target_university_1"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Target Universitas (Pilihan 1)</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Mis: Universitas Indonesia"
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
                  <FieldLabel>Target Jurusan (Pilihan 1)</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Mis: Ilmu Komputer"
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>

        {/* Target Pilihan 2 */}
        <div className="pt-1">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
            Target Pilihan 2 (Alternatif)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="target_university_2"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Target Universitas (Pilihan 2)</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Mis: Universitas Brawijaya"
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
                  <FieldLabel>Target Jurusan (Pilihan 2)</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Mis: Teknik Informatika"
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>

      </FieldGroup>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Lanjut"}
        </Button>
      </div>
    </form>
  );
}
