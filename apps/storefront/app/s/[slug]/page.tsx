import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  emptyPaginated,
  getStore,
  getStoreCategories,
  getStoreProducts,
} from "@/services/storefrontService";
import { StorefrontPage } from "@/components/storefront/StorefrontPage";
import type { Category, Product } from "@/types/models";
import type { RawPaginated } from "@/types/pagination";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
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
