import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Store, Package, Phone, MapPin, ShoppingBag, MessageCircle } from "lucide-react";
import { Skeleton } from "@katenda_clients/ui";
import { useStorefront } from "@/hooks/useStorefront";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useStorefront(slug || "");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Store className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Tienda no encontrada</h1>
        <p className="text-sm text-muted-foreground">La tienda que buscas no existe o está inactiva.</p>
        <Link to="/" className="text-brand hover:underline text-sm">Volver al inicio</Link>
      </div>
    );
  }

  const { store, products, categories } = data;
  const whatsapp = store.contacts?.find((c) => c.type === "whatsapp");

  const filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-brand/30 via-accent/20 to-background">
        {store.banner_url && (
          <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        {window.history.length > 1 && (
          <div className="absolute top-4 left-4">
            <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
        )}
      </div>

      {/* Store info */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex items-end gap-4 mb-6">
          <div className="h-20 w-20 md:h-28 md:w-28 rounded-2xl bg-card border-4 border-background shadow-lg grid place-items-center overflow-hidden shrink-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-brand">{store.name[0]}</span>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
            {store.description && (
              <p className="text-sm text-muted-foreground mt-1">{store.description}</p>
            )}
          </div>
        </div>

        {/* Contacts bar */}
        {store.contacts && store.contacts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {store.contacts.map((contact) => (
              <a
                key={contact.uuid}
                href={contact.type === "whatsapp" ? `https://wa.me/${contact.value}` : `tel:${contact.value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm hover:border-brand/30 transition-colors"
              >
                {contact.type === "whatsapp" ? (
                  <MessageCircle className="h-4 w-4 text-brand" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {contact.label || contact.value}
              </a>
            ))}
          </div>
        )}

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                selectedCategory === null ? "bg-brand text-brand-foreground" : "bg-card border border-border hover:border-brand/30",
              )}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  selectedCategory === cat.id ? "bg-brand text-brand-foreground" : "bg-card border border-border hover:border-brand/30",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
            const image = product.media?.find((m) => m.type === "image");
            return (
              <div
                key={product.uuid}
                className="group rounded-xl bg-card border border-border overflow-hidden hover:shadow-md hover:border-brand/30 transition-all"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {image ? (
                    <img src={image.url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-muted-foreground">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-brand">${Number(product.price).toFixed(2)}</p>
                  {product.stock > 0 ? (
                    <span className="text-xs text-muted-foreground">{product.stock} en stock</span>
                  ) : (
                    <span className="text-xs text-destructive">Sin stock</span>
                  )}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp.value}?text=Hola, quiero comprar: ${product.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-1 mt-2 w-full py-1.5 rounded-lg bg-brand/15 text-brand text-xs font-medium hover:bg-brand/25 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Pedir por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay productos en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}
