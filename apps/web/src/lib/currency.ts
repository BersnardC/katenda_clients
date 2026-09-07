// Formateo de moneda compartido (storefront preview, clientes, etc.).
// Sin tasas de conversión reales: cada monto se formatea en su moneda de
// referencia (primaria) y, si existe, se muestra la referencia secundaria.
export const fmtCurrency = (amount: number, code: string): string => {
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
};
