import { cn } from '@/lib/utils'
import { categoryGlyph } from '@/lib/categoryGlyph'
import type { Category } from '@/types/models'

export function CategoryGlyph({
  category,
  className,
  glyphClassName,
}: {
  category: Pick<Category, 'image_url' | 'icon' | 'name'>
  className?: string
  glyphClassName?: string
}) {
  const { image, glyph } = categoryGlyph(category)

  if (image) {
    return (
      <img
        src={image}
        alt={category.name}
        className={cn('object-cover bg-muted', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid place-items-center bg-muted text-muted-foreground',
        className,
      )}
    >
      <span className={cn('font-semibold leading-none', glyphClassName)}>
        {glyph}
      </span>
    </div>
  )
}
