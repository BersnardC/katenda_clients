import { api } from "@/lib/api";
import type { Country } from "@/types/models";

export const countryService = {
  // GET /countries -> { countries } (referencia, con currency embebida)
  list: () => api.get<{ countries: Country[] }>("/countries"),
};
