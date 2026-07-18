import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Pencil, Trash2, Upload, X, Store } from "lucide-react";
import {
  Button, Input, Label, Skeleton, Textarea,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@katenda_clients/ui";
import { useI18n } from "@/lib/i18n";
import { useAllProducts, type ProductWithStore } from "@/hooks/useAllProducts";
import { useActiveStore } from "@/contexts/StoreContext";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useDeactivateProduct } from "@/hooks/useProducts";
import { mediaService } from "@/services/mediaService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Products() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { activeStore } = useActiveStore();
  const { data: products, isLoading, stores } = useAllProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct(activeStore?.uuid || "");
  const deactivateProduct = useDeactivateProduct(activeStore?.uuid || "");
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithStore | null>(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [categoryId, setCategoryId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const storeCount = stores?.length ?? 0;
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  const resetForm = () => {
    setForm({ name: "", price: "", description: "" });
    setCategoryId("");
    setFiles([]);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error(t("error.required"));
      return;
    }
    if (!activeStore) {
      toast.error("No hay tienda activa");
      return;
    }
    try {
      const res = await createProduct.mutateAsync({
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        price: Number(form.price),
        description: form.description,
        category_id: categoryId ? Number(categoryId) : null,
      });
      const productUuid = res.data.product.uuid;
      if (files.length > 0) {
        await mediaService.create("products", productUuid, files);
        qc.invalidateQueries({ queryKey: ["media", "products", productUuid] });
      }
      toast.success("Producto creado correctamente");
      setOpen(false);
      resetForm();
    } catch {
      // toast ya mostrado por el hook mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deactivateProduct.mutateAsync(deleteTarget.uuid);
      setDeleteTarget(null);
    } catch {
      // toast ya mostrado por el hook
    }
  };

  return (
    <div>
      <PageHeader
        title={t("products.title")}
        description={`${products.length} productos en ${storeCount} tiendas`}
      >
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:opacity-90 h-11 font-semibold shadow-lg shadow-accent/20 cursor-pointer">
              <Plus className="h-4 w-4 mr-1" />
              {t("products.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("products.add")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("products.name")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Filtro de aceite K90"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("products.price")} (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("products.category")}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("products.desc")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-brand bg-brand/5" : "border-border"}`}
                onClick={() => document.getElementById("product-files")?.click()}
              >
                <input
                  id="product-files"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t("products.photos")}</p>
                {files.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap justify-center">
                    {files.map((f, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(f)}
                          className="h-14 w-14 rounded-lg object-cover"
                          alt=""
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center bg-accent text-accent-foreground rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => { setOpen(false); resetForm(); }}
              >
                {t("products.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={createProduct.isPending}
                className="bg-brand text-brand-foreground hover:opacity-90"
              >
                {createProduct.isPending ? "Guardando..." : t("products.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Search */}
      {!isLoading && !!products.length && (
        <div className="relative mb-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("products.search")}
            className="pl-9 h-11 bg-card"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="bg-card rounded-2xl overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 border-t border-border first:border-t-0">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : !products.length ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title={t("products.empty")}
          description={t("products.empty_desc")}
          action={
            <Button
              onClick={() => navigate("/stores")}
              className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
            >
              <Store className="h-4 w-4 mr-1" />
              {t("products.go_stores")}
            </Button>
          }
        />
      ) : !filtered.length ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="Sin resultados"
          description="Intenta con otro término de búsqueda."
        />
      ) : (
        <div className="bg-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="text-left p-3 w-12"></th>
                <th className="text-left p-3">{t("products.title")}</th>
                <th className="text-left p-3 hidden md:table-cell">{t("products.store")}</th>
                <th className="text-left p-3 hidden lg:table-cell">{t("products.category")}</th>
                <th className="text-right p-3">{t("products.price")}</th>
                <th className="text-center p-3 hidden sm:table-cell">{t("products.status")}</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const image = product.media?.[0];
                const category = categories?.find((c) => c.id === product.category_id);
                return (
                  <tr
                    key={`${product.store_uuid}-${product.uuid}`}
                    className="border-t border-border hover:bg-background/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/stores/${product.store_uuid}/products/${product.uuid}`)}
                  >
                    <td className="p-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        {image ? (
                          <img
                            src={image.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium truncate block max-w-[200px]">
                        {product.name}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {product.store_name}
                    </td>
                    <td className="p-3 text-muted-foreground hidden lg:table-cell">
                      {category?.name || "—"}
                    </td>
                    <td className="p-3 text-right font-bold text-brand">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      {product.stock > 0 ? (
                        <span className="text-[10px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                          {product.status === 1 ? t("products.active") : t("products.inactive")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          {t("products.out_stock")}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/stores/${product.store_uuid}/products/${product.uuid}/edit`);
                          }}
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(product);
                          }}
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-accent/10 text-accent"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={t("products.delete_title")}
        description={t("products.delete_desc")}
        confirmLabel={t("products.delete_title")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
