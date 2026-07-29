export const formatPrice = (value: number | string | null | undefined) => {
  if (!value) return "Rp 0";

  const number = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
