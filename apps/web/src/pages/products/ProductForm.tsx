import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button, Input, Label, Card, CardContent, Combobox, Skeleton } from "@katenda_clients/ui";
import { useActiveStore } from "@/contexts/StoreContext";
import { useStore } from "@/hooks/useStores";
import { useProducts, useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { usePlanLimit } from "@/hooks/useAccount";
import { useMedia, useDeleteMedia } from "@/hooks/useMedia";
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
  const location = useLocation();
  const storeUuid = paramStoreUuid || (location.state as { storeUuid?: string })?.storeUuid || activeStore?.uuid || "";
  const { data: store } = useStore(storeUuid);
  const { data: products } = useProducts(storeUuid);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct(storeUuid);
  const updateProduct = useUpdateProduct(storeUuid);
  const qc = useQueryClient();

  const { data: existingMedia, isLoading: loadingMedia } = useMedia("products", uuid || "");
  const deleteMedia = useDeleteMedia("products", uuid || "");

  const existing = products?.find((p) => p.uuid === uuid);

  const [form, setForm] = useState({
    name: "", slug: "", price: "", stock: "", description: "", code: "", category_id: null as number | null,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const existingCount = existingMedia?.length ?? 0;
  const maxImages = usePlanLimit("media_per_product");
  const maxProducts = usePlanLimit("products");
  const atMaxProducts = maxProducts !== undefined && maxProducts !== -1 && (products?.length ?? 0) >= maxProducts;

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        price: String(existing.price),
        stock: String(existing.stock),
        description: existing.description || "",
        code: existing.code || "",
        category_id: existing.category_id,
      });
    }
  }, [existing]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const total = existingCount + files.length + incoming.length;
    if (maxImages !== undefined && maxImages !== -1 && total > maxImages) {
      const allowed = maxImages - (existingCount + files.length);
      if (allowed <= 0) {
        toast.warning(`Límite de ${maxImages} imágenes por producto.`);
        return;
      }
      setFiles((prev) => [...prev, ...incoming.slice(0, allowed)]);
      toast.warning(`Solo se agregaron ${allowed} de ${incoming.length} imágenes. Máximo ${maxImages} por producto.`);
    } else {
      setFiles((prev) => [...prev, ...incoming]);
    }
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
      const data = {
        ...form,
        price: form.price === "" ? 0 : parseFloat(form.price),
        stock: form.stock === "" ? 0 : parseInt(form.stock, 10),
      };
      let productUuid: string;
      if (isEdit) {
        await updateProduct.mutateAsync({ uuid: uuid!, data });
        productUuid = uuid!;
      } else {
        const res = await createProduct.mutateAsync(data);
        productUuid = res.data.product.uuid;
      }
      if (files.length > 0) {
        await mediaService.create("products", productUuid, files);
        qc.invalidateQueries({ queryKey: ["media", "products", productUuid] });
      }
      navigate(fromList ? "/products" : `/stores/${storeUuid}`);
    } catch {
      // toast ya mostrado por el hook mutation
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div>
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

      <div className="max-w-xl mx-auto">
      {!isEdit && atMaxProducts && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-4 mb-4 text-center">
          Has alcanzado el límite de {maxProducts} productos de tu plan actual.
          {maxProducts !== -1 && " Elimina algunos productos o cambia de plan para crear más."}
        </div>
      )}
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
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SKU-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Combobox
                items={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                value={form.category_id}
                onChange={(val) => setForm({ ...form, category_id: val as number | null })}
                placeholder="Sin categoría"
                searchPlaceholder="Buscar categoría..."
                clearable
                clearLabel="Sin categoría"
                popoverClassName="bg-card border-border shadow-lg"
              />
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

            <div className="space-y-3">
              <Label>Imágenes</Label>

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
                {maxImages !== undefined && maxImages !== -1 && (
                  <p className={`text-xs mt-1 ${existingCount + files.length >= maxImages ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {existingCount + files.length}/{maxImages} imágenes
                  </p>
                )}
              </div>

              {isEdit && loadingMedia ? (
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-14 rounded-lg" />)}
                </div>
              ) : existingCount + files.length > 0 ? (
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {existingMedia?.map((m) => (
                    <div key={m.uuid} className="relative">
                      <img src={m.url} className="h-14 w-14 rounded-lg object-cover" alt="" />
                      <button
                        type="button"
                        onClick={() => deleteMedia.mutate(m.uuid)}
                        className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center bg-accent text-accent-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {files.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} className="h-14 w-14 rounded-lg object-cover" alt="" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center bg-accent text-accent-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Button type="submit" disabled={isPending || (!isEdit && atMaxProducts)} className="w-full h-10 bg-accent text-accent-foreground hover:opacity-90 font-semibold cursor-pointer">
              {isPending
                ? "Guardando..."
                : !isEdit && atMaxProducts
                  ? "Límite de productos alcanzado"
                  : isEdit
                    ? "Guardar cambios"
                    : "Crear producto"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
