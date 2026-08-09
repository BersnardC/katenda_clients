import type { Permission } from '@/types/models'

export interface PermissionGroup {
  prefix: string
  label: string
  items: Permission[]
}

export function groupPermissions(
  permissions: Permission[],
  labelFor: (prefix: string) => string,
): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>()
  for (const p of permissions) {
    if (p.scope !== 'organization') continue
    const prefix = p.key.split('.')[0]
    const existing = groups.get(prefix)
    if (existing) {
      existing.items.push(p)
    } else {
      groups.set(prefix, {
        prefix,
        label: labelFor(prefix),
        items: [p],
      })
    }
  }
  return Array.from(groups.values())
}

export function permissionLabel(
  permissions: Permission[],
  permissionId: number,
  groupLabel: string,
): string {
  const perm = permissions.find((p) => p.id === permissionId)
  return perm ? `${groupLabel}: ${perm.name}` : String(permissionId)
}
