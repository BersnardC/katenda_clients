// src/pages/Publish.tsx
import { useState } from "react";
import { postService } from "../services/postService";
import toast from "react-hot-toast";

export default function Publish() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await postService.create({ title, body });
      toast.success("Publicado correctamente");
      setTitle("");
      setBody("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al publicar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Crear publicación</h2>
      <form onSubmit={handle} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full p-2 border rounded" placeholder="Contenido" value={body} onChange={e => setBody(e.target.value)} />
        <button className="py-2 px-4 bg-indigo-600 text-white rounded" disabled={saving}>
          {saving ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
