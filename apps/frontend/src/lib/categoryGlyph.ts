import type { Category } from '@/types/models'

export function categoryGlyph(
  category: Pick<Category, 'image_url' | 'icon' | 'name'>,
): { image?: string; glyph: string } {
  if (category.image_url) return { image: category.image_url, glyph: '' }
  const icon = category.icon?.trim()
  return { glyph: icon || category.name.charAt(0).toUpperCase() }
}
