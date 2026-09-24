import imageCompression from "browser-image-compression";

const webpSupported = (() => {
  try {
    const c = document.createElement("canvas");
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
})();

// Comprime en el navegador: <=1MB, máx 1600px, WebP si es soportado.
export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.8,
    ...(webpSupported ? { fileType: "image/webp" } : {}),
  });

  // Si ya era más liviana, no la tocamos.
  if (compressed.size >= file.size) return file;

  const base = file.name.replace(/\.[^/.]+$/, "") || "image";
  const ext = webpSupported
    ? "webp"
    : file.type === "image/png"
      ? "png"
      : "jpg";
  return new File([compressed], `${base}.${ext}`, { type: compressed.type });
}
