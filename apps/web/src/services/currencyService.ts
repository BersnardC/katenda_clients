import { api } from "@/lib/api";
import type { Currency } from "@/types/models";

export const currencyService = {
  // GET /currencies -> { currencies } (referencia)
  list: () => api.get<{ currencies: Currency[] }>("/currencies"),
};
