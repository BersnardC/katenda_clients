import { icons, Tag } from "lucide-react";
import type { LucideProps } from "lucide-react";

export function DynamicIcon({
  name,
  className,
  ...props
}: Omit<LucideProps, "name"> & { name?: string | null; className?: string }) {
  if (name && name in icons) {
    const Cmp = icons[name as keyof typeof icons];
    return <Cmp className={className} {...props} />;
  }
  if (name) return <span className={className}>{name}</span>;
  return <Tag className={className} {...props} />;
}
