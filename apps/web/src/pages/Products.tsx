import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Pencil, Trash2, Store } from "lucide-react";
import { Button, Input, Skeleton } from "@katenda_clients/ui";
import { useI18n } from "@/lib/i18n";
import { useAllProducts, type ProductWithStore } from "@/hooks/useAllProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteProduct } from "@/hooks/useProducts";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Products() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: products, isLoading, stores } = useAllProducts();
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();

  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductWithStore | null>(null);

  const storeCount = stores?.length ?? 0;
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync({
        storeUuid: deleteTarget.store_uuid,
        uuid: deleteTarget.uuid,
      });
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
        <Button
          onClick={() => navigate("/products/new")}
          className="bg-accent text-accent-foreground hover:opacity-90 h-11 font-semibold shadow-lg shadow-accent/20 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("products.add")}
        </Button>
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
                    onClick={() => navigate(`/products/${product.uuid}`)}
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
                            navigate(`/products/${product.uuid}/edit`);
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
        confirmLabel={t("products.delete_confirm")}
        loading={deleteProduct.isPending}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
