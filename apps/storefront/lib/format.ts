// Formatea un monto con la moneda del catálogo (Intl.NumberFormat).
// Fallback a "<code> <amount>" si el código de moneda es inválido.
export function fmtCurrency(amount: number, code: string): string {
  try {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function fmtDate(date: Date): string {
  return date.toLocaleDateString("es-ES");
}
