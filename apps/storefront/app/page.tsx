import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  emptyPaginated,
  getStore,
  getStoreCategories,
  getStoreProducts,
} from "@/services/storefrontService";
import { requireSlug } from "@/lib/slug";
import { StorefrontPage } from "@/components/storefront/StorefrontPage";
import type { Category, Product } from "@/types/models";
import type { RawPaginated } from "@/types/pagination";

interface Props {
  searchParams: Promise<{ slug?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const slug = await requireSlug(sp.slug);
  try {
    const { store } = await getStore(slug);
    const title = `${store.name} — Compra online y pide por WhatsApp`;
    const description =
      store.description ??
      "Catálogo público: busca productos, arma tu carrito y envía tu pedido por WhatsApp.";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://${store.slug}.katenda.com`,
        images: store.logo_url ? [{ url: store.logo_url }] : undefined,
      },
    };
  } catch {
    return { title: "Tienda no encontrada", robots: { index: false } };
  }
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const slug = await requireSlug(sp.slug);

  const data = await getStore(slug).catch(() => null);
  if (!data) notFound();

  const [{ products }, { categories }] = await Promise.all([
    getStoreProducts(slug).catch(
      (): { products: RawPaginated<Product> } => ({
        products: emptyPaginated<Product>(),
      }),
    ),
    getStoreCategories(slug).catch(
      (): { categories: Category[] } => ({ categories: [] }),
    ),
  ]);

  return (
    <StorefrontPage
      store={data.store}
      account={data.account}
      products={products.data ?? []}
      categories={categories ?? []}
    />
  );
}
