export const APP_TIME_ZONE = "Asia/Jakarta";

export function formatJakartaDate(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Date(value).toLocaleDateString("id-ID", {
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}

export function formatJakartaDateTime(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}
