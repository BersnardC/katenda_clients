import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Skeleton } from "@katenda_clients/ui";
import { useActiveStore } from "@/contexts/StoreContext";
import { useStore } from "@/hooks/useStores";
import { useProducts, useUpdateProduct, useDeactivateProduct } from "@/hooks/useProducts";
import { useMedia, useAddMedia, useDeleteMedia } from "@/hooks/useMedia";
import { useCategories } from "@/hooks/useCategories";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ProductDetail() {
  const { storeUuid: paramStoreUuid, uuid } = useParams<{ storeUuid?: string; uuid: string }>();
  const { activeStore } = useActiveStore();
  const navigate = useNavigate();
  const fromList = !paramStoreUuid;
  const storeUuid = paramStoreUuid || activeStore?.uuid || "";
  const { data: store } = useStore(storeUuid);
  const { data: products } = useProducts(storeUuid);
  const { data: media, isLoading: loadingMedia } = useMedia("products", uuid || "");
  const addMedia = useAddMedia("products", uuid || "");
  const deleteMedia = useDeleteMedia("products", uuid || "");
  const updateProduct = useUpdateProduct(storeUuid);
  const deactivateProduct = useDeactivateProduct(storeUuid);
  const { data: categories } = useCategories();

  const product = products?.find((p) => p.uuid === uuid);
  const category = categories?.find((c) => c.id === product?.category_id);

  const [dragOver, setDragOver] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", price: 0, stock: 0, description: "", code: "" });

  if (!product) {
    return <div className="text-muted-foreground">Producto no encontrado</div>;
  }

  const addFiles = (list: FileList | null) => {
    if (!list || !list.length) return;
    addMedia.mutateAsync(Array.from(list));
  };

  const handleSaveEdit = async () => {
    await updateProduct.mutateAsync({ uuid: product.uuid, data: form });
    setEditMode(false);
  };

  const toggleEdit = () => {
    if (!editMode) {
      setForm({
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        stock: product.stock,
        description: product.description || "",
        code: product.code || "",
      });
    }
    setEditMode(!editMode);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <button
        onClick={() => navigate(fromList ? "/products" : `/stores/${storeUuid}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {fromList ? "Volver a productos" : `Volver a ${store?.name || "tienda"}`}
      </button>

      <PageHeader title={product.name}>
        <Button variant="outline" onClick={toggleEdit} className="cursor-pointer">
          {editMode ? "Cancelar" : "Editar"}
        </Button>
        <Button variant="outline" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive cursor-pointer">
          Desactivar
        </Button>
      </PageHeader>

      {editMode ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Precio ($)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm md:text-sm resize-none"
              />
            </div>
            <Button onClick={handleSaveEdit} disabled={updateProduct.isPending} className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer">
              {updateProduct.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precio</span>
                <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock</span>
                <span className={`text-sm font-medium ${product.stock > 0 ? "text-brand" : "text-destructive"}`}>
                  {product.stock > 0 ? `${product.stock} unidades` : "Sin stock"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Código</span>
                <span className="text-sm font-mono">{product.code || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categoría</span>
                <span className="text-sm">{category?.name || "Sin categoría"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === 1 ? "bg-brand/15 text-brand" : "bg-destructive/15 text-destructive"}`}>
                  {product.status === 1 ? "Activo" : "Inactivo"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{product.description || "Sin descripción"}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-brand bg-brand/5" : "border-border"}`}
            onClick={() => document.getElementById("detail-files")?.click()}
          >
            <input id="detail-files" type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Arrastra imágenes o haz clic para subir</p>
          </div>

          {loadingMedia ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-24 rounded-lg" />)}
            </div>
          ) : !media?.length ? (
            <p className="text-sm text-muted-foreground">Sin imágenes aún. Arrastra o selecciona archivos arriba.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {media.map((m) => (
                <div key={m.uuid} className="group relative h-24 w-24 rounded-lg overflow-hidden border border-border">
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => deleteMedia.mutate(m.uuid)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Desactivar producto"
        description="El producto dejará de ser visible en la tienda."
        confirmLabel="Desactivar"
        variant="destructive"
        onConfirm={() => { deactivateProduct.mutate(product.uuid); navigate(fromList ? "/products" : `/stores/${storeUuid}`); }}
      />
    </div>
  );
}
