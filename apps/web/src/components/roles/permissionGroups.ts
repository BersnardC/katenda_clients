import type { Permission } from "@/types/models";

export interface PermissionGroup {
  key: string;
  label: string;
  items: Permission[];
}

export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const map = new Map<string, Permission[]>();
  for (const p of permissions) {
    const group = p.key.split(".")[0];
    const list = map.get(group) ?? [];
    list.push(p);
    map.set(group, list);
  }
  return Array.from(map.entries())
    .map(([key, items]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      items: [...items].sort((a, b) => a.id - b.id),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
