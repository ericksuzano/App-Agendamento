export function formatarDataBR(isoDate /* ex.: '2025-10-23' */) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  const data = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}
