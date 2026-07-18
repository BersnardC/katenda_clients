import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button, Input, Label, Card, CardContent } from "@katenda_clients/ui";
import { useActiveStore } from "@/contexts/StoreContext";
import { useStore } from "@/hooks/useStores";
import { useProducts, useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { mediaService } from "@/services/mediaService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function ProductForm() {
  const { storeUuid: paramStoreUuid, uuid } = useParams();
  const { activeStore } = useActiveStore();
  const navigate = useNavigate();
  const isEdit = !!uuid;
  const fromList = !paramStoreUuid;
  const storeUuid = paramStoreUuid || activeStore?.uuid || "";
  const { data: store } = useStore(storeUuid);
  const { data: products } = useProducts(storeUuid);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct(storeUuid);
  const updateProduct = useUpdateProduct(storeUuid);
  const qc = useQueryClient();

  const existing = products?.find((p) => p.uuid === uuid);

  const [form, setForm] = useState({
    name: "", slug: "", price: 0, stock: 0, description: "", code: "", category_id: null as number | null,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        price: Number(existing.price),
        stock: existing.stock,
        description: existing.description || "",
        code: existing.code || "",
        category_id: existing.category_id,
      });
    }
  }, [existing]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUuid) {
      toast.error("No hay tienda activa");
      navigate("/products");
      return;
    }
    try {
      let productUuid: string;
      if (isEdit) {
        await updateProduct.mutateAsync({ uuid: uuid!, data: form });
        productUuid = uuid!;
      } else {
        const res = await createProduct.mutateAsync(form);
        productUuid = res.data.product.uuid;
        if (files.length > 0) {
          await mediaService.create("products", productUuid, files);
          qc.invalidateQueries({ queryKey: ["media", "products", productUuid] });
        }
      }
      navigate(fromList ? "/products" : `/stores/${storeUuid}`);
    } catch {
      // toast ya mostrado por el hook mutation
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="max-w-xl">
      {!fromList && (
        <button
          onClick={() => navigate(`/stores/${storeUuid}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a {store?.name || "tienda"}
        </button>
      )}

      <PageHeader title={isEdit ? "Editar producto" : "Nuevo producto"}>
        <Button variant="outline" onClick={() => navigate(fromList ? "/products" : `/stores/${storeUuid}`)} className="cursor-pointer">
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
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="nombre-del-producto" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Precio ($)</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SKU-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <select
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm"
              >
                <option value="">Sin categoría</option>
                {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm md:text-sm resize-none"
                placeholder="Descripción del producto..."
              />
            </div>

            {!isEdit && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-brand bg-brand/5" : "border-border"}`}
                onClick={() => document.getElementById("product-files")?.click()}
              >
                <input id="product-files" type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Arrastra imágenes o haz clic para seleccionar</p>
                {files.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap justify-center">
                    {files.map((f, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(f)} className="h-14 w-14 rounded-lg object-cover" alt="" />
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center bg-accent text-accent-foreground rounded-full">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full h-10 bg-accent text-accent-foreground hover:opacity-90 font-semibold cursor-pointer">
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
