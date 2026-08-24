import { api } from "@/lib/api";
import type { Permission } from "@/types/models";

export const permissionService = {
  // GET /permissions -> { permissions: Permission[] }
  list: () => api.get<{ permissions: Permission[] }>("/permissions"),
};
