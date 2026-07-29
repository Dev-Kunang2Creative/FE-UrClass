import { api } from "@/lib/axios";
import { UpdateProfileType } from "@/validators/profile/update-profile-validator";

export const updateProfileApiHandler = async (
  token: string,
  body: UpdateProfileType,
) => {
  const payload = {
    name: body.name,
    phone_number: body.phone_number,
    school_origin: body.school_origin,
    grade_level: `${body.grade_level} ${body.class_level}`, 
    // Sending actual form values with fallback for backend rules compatibility
    birth_date: body.birth_date || "2000-01-01",
    gender: body.gender || "L",
    province: body.province || "-",
    city: body.city || "-",
    target_university_1: body.target_university_1 || "-",
    target_major_1: body.target_major_1 || "-",
  };

  const { data } = await api.put("/profile/update", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
