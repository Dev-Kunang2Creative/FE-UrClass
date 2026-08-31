import { api } from "@/lib/axios";
import { UpdateProfileType } from "@/validators/profile/update-profile-validator";

/**
 * Sends what the reader actually entered.
 *
 * This used to paper over the backend required-rules with invented values:
 * `birth_date || "2000-01-01"`, `gender || "L"`, `province || "-"` and
 * `target_university_1 || "-"`. Anyone who left the birth date blank was
 * silently recorded as born on 1 January 2000, defaulted to male, and given
 * "-" as their target campus - and then shown those values back as if they
 * had typed them. The form asks for these fields instead, and the schema now
 * matches what the server requires, so there is nothing left to fake.
 */
export const updateProfileApiHandler = async (
  token: string,
  body: UpdateProfileType,
) => {
  const payload = {
    name: body.name,
    phone_number: body.phone_number,
    school_origin: body.school_origin,
    // Gap Year carries no class, and the trailing space this used to send
    // ("Gap Year ") did not match what the session was told.
    grade_level: buildGradeLevel(body),
    birth_date: body.birth_date,
    gender: body.gender,
    province: body.province || null,
    city: body.city || null,
    target_university_1: body.target_university_1 || null,
    target_major_1: body.target_major_1 || null,
    target_university_2: body.target_university_2 || null,
    target_major_2: body.target_major_2 || null,
    // Target jalur CPNS. Sekolah kedinasan memakai target_university_* dan
    // target_major_* di atas, karena bentuknya sama dengan target PTN.
    cpns_target_type: body.cpns_target_type || null,
    target_instansi_1: body.target_instansi_1 || null,
    target_formasi_1: body.target_formasi_1 || null,
    target_instansi_2: body.target_instansi_2 || null,
    target_formasi_2: body.target_formasi_2 || null,
  };

  const { data } = await api.put("/profile/update", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/** Single source of truth for the stored grade string. */
export function buildGradeLevel(body: UpdateProfileType): string {
  if (body.grade_level === "Gap Year") return "Gap Year";
  return `${body.grade_level} ${body.class_level ?? ""}`.trim();
}
