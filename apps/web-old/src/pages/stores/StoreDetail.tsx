import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Package, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from "@katenda_clients/ui";
import { useStore, useDeactivateStore } from "@/hooks/useStores";
import { useProducts, useDeactivateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import ViewToggle from "@/components/ViewToggle";

const PAGE_SIZE = 12;

export default function StoreDetail() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: store, isLoading: loadingStore } = useStore(uuid || "");
  const { data: products, isLoading: loadingProducts } = useProducts(uuid || "");
  const { data: categories } = useCategories();
  const deactivateStore = useDeactivateStore();
  const deactivateProduct = useDeactivateProduct(uuid || "");

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [deleteStoreOpen, setDeleteStoreOpen] = useState(false);
  const [deleteProductUuid, setDeleteProductUuid] = useState<string | null>(null);

  if (loadingStore) return null;
  if (!store) return <div className="text-muted-foreground">Tienda no encontrada</div>;

  const filtered = (products || []).filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === null || p.category_id === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageProducts = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title={store.name}
        description={
          <span>
            /{store.slug}
            <button onClick={() => navigate(`/stores/${uuid}/edit`)} className="text-brand hover:underline ml-2">Editar</button>
          </span>
        }
      >
        <Button
          variant="outline"
          onClick={() => window.open(`/s/${store.slug}`, "_blank")}
          className="cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-1" />Ver tienda
        </Button>
        <Button variant="outline" onClick={() => setDeleteStoreOpen(true)} className="text-destructive hover:text-destructive cursor-pointer">
          <Trash2 className="h-4 w-4 mr-1" />Desactivar
        </Button>
      </PageHeader>

      {store.description && <p className="text-sm text-muted-foreground mb-6">{store.description}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar productos..." className="pl-9" />
        </div>
        <select
          value={categoryFilter ?? ""}
          onChange={(e) => { setCategoryFilter(e.target.value ? Number(e.target.value) : null); setPage(0); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <ViewToggle value={view} onChange={setView} />
        <Button
          onClick={() => navigate(`/stores/${uuid}/products/new`)}
          className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer h-9 shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />Añadir
        </Button>
      </div>

      {/* Product list */}
      {loadingProducts ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-4 w-24" /></CardContent></Card>
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title={search || categoryFilter ? "Sin resultados" : "Sin productos aún"}
          description={search || categoryFilter ? "Intenta con otros filtros." : "Añade tu primer producto a esta tienda."}
          action={!search && !categoryFilter ? (
            <Button onClick={() => navigate(`/stores/${uuid}/products/new`)} className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer">
              <Plus className="h-4 w-4 mr-1" />Añadir producto
            </Button>
          ) : undefined}
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pageProducts.map((product) => (
              <Card key={product.uuid} className="group relative cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => navigate(`/stores/${uuid}/products/${product.uuid}`)}>
                <div className="aspect-square bg-muted overflow-hidden">
                  {product.media?.[0] ? (
                    <img src={product.media[0].url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-muted-foreground">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/stores/${uuid}/products/${product.uuid}/edit`); }}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteProductUuid(product.uuid); }}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? "bg-brand/15 text-brand" : "bg-destructive/15 text-destructive"}`}>
                    {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 w-12"></th>
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium">Precio</th>
                <th className="text-left p-3 font-medium">Stock</th>
                <th className="text-left p-3 font-medium">Código</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((product) => (
                <tr key={product.uuid} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/stores/${uuid}/products/${product.uuid}`)}>
                  <td className="p-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                      {product.media?.[0] ? (
                        <img src={product.media[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-muted-foreground">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">${Number(product.price).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? "bg-brand/15 text-brand" : "bg-destructive/15 text-destructive"}`}>{product.stock}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{product.code || "—"}</td>
                  <td className="p-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/stores/${uuid}/products/${product.uuid}/edit`); }} className="p-1 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4 inline" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteProductUuid(product.uuid); }} className="p-1 text-muted-foreground hover:text-destructive ml-1">
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{filtered.length} productos</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1 rounded-md hover:bg-muted disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>Página {page + 1} de {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1 rounded-md hover:bg-muted disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog open={deleteStoreOpen} onOpenChange={setDeleteStoreOpen}
        title="Desactivar tienda" description="¿Estás seguro? La tienda y sus productos dejarán de ser visibles."
        confirmLabel="Desactivar" variant="destructive"
        onConfirm={() => { deactivateStore.mutate(uuid!); navigate("/stores"); }} />

      <ConfirmDialog open={!!deleteProductUuid} onOpenChange={() => setDeleteProductUuid(null)}
        title="Desactivar producto" description="El producto dejará de ser visible en la tienda."
        confirmLabel="Desactivar" variant="destructive"
        onConfirm={() => { if (deleteProductUuid) deactivateProduct.mutate(deleteProductUuid); setDeleteProductUuid(null); }} />
    </div>
  );
}
