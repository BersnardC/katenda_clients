import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Label, Card, CardContent } from "@katenda_clients/ui";
import { useStore, useCreateStore, useUpdateStore } from "@/hooks/useStores";
import PageHeader from "@/components/PageHeader";

export default function StoreForm() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;
  const { data: store, isLoading: loadingStore } = useStore(uuid || "");
  const createStore = useCreateStore();
  const updateStore = useUpdateStore(uuid || "");

  const [form, setForm] = useState({ name: "", slug: "", description: "", domain: "" });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name,
        slug: store.slug,
        description: store.description || "",
        domain: store.domain || "",
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateStore.mutateAsync(form);
    } else {
      await createStore.mutateAsync(form);
    }
    navigate("/stores");
  };

  const isPending = createStore.isPending || updateStore.isPending;

  if (isEdit && loadingStore) return <div className="text-muted-foreground">Cargando...</div>;

  return (
    <div className="max-w-xl">
      <PageHeader title={isEdit ? "Editar tienda" : "Nueva tienda"}>
        <Button variant="outline" onClick={() => navigate("/stores")} className="cursor-pointer">
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
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: isEdit ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                placeholder="Mi Tienda"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="mi-tienda"
                required
              />
              <p className="text-xs text-muted-foreground">URL pública: katenda.com/<b>{form.slug || "mi-tienda"}</b></p>
            </div>
            <div className="space-y-1.5">
              <Label>Dominio personalizado (opcional)</Label>
              <Input
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="tienda.midominio.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm md:text-sm resize-none"
                placeholder="Describe tu tienda..."
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-10 bg-accent text-accent-foreground hover:opacity-90 font-semibold cursor-pointer"
            >
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tienda"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
