import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, Card, CardContent } from "@katenda_clients/ui";
import { useCategories, useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import PageHeader from "@/components/PageHeader";

export default function CategoryForm() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;
  const { data: categories } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();

  const existing = categories?.find((c) => c.uuid === uuid);

  const [form, setForm] = useState({ name: "", slug: "" });

  useEffect(() => {
    if (existing) {
      setForm({ name: existing.name, slug: existing.slug });
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateCat.mutateAsync({ uuid: uuid!, data: form });
    } else {
      await createCat.mutateAsync(form);
    }
    navigate("/categories");
  };

  const isPending = createCat.isPending || updateCat.isPending;

  return (
    <div className="max-w-xl">
      <button
        onClick={() => navigate("/categories")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a categorías
      </button>

      <PageHeader title={isEdit ? "Editar categoría" : "Nueva categoría"}>
        <Button variant="outline" onClick={() => navigate("/categories")} className="cursor-pointer">
          Cancelar
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({
                  ...form, name: e.target.value,
                  slug: isEdit ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                })}
                placeholder="Nombre de la categoría"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="nombre-categoria" required />
            </div>
            <Button type="submit" disabled={isPending} className="w-full h-10 bg-accent text-accent-foreground hover:opacity-90 font-semibold cursor-pointer">
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
