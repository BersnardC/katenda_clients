import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function dataUrlToFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const base = filename.replace(/\.[^/.]+$/, "") || "image";
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}
