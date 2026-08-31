import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  emptyPaginated,
  getProduct,
  getStore,
  getStoreProducts,
} from "@/services/storefrontService";
import { ProductPage } from "@/components/product/ProductPage";
import type { Product } from "@/types/models";
import type { RawPaginated } from "@/types/pagination";

interface Props {
  params: Promise<{ slug: string; productUuid: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productUuid } = await params;
  try {
    const { product } = await getProduct(slug, productUuid);
    const title = `${product.name} — Compra online y pide por WhatsApp`;
    const description =
      product.description?.slice(0, 155) ??
      `Compra ${product.name} y pide por WhatsApp.`;
    const image = product.media?.[0]?.url;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://${slug}.katenda.com/p/${productUuid}`,
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: "Producto no disponible", robots: { index: false } };
  }
}

export default async function ProductPageRoute({ params }: Props) {
  const { slug, productUuid } = await params;

  const productRes = await getProduct(slug, productUuid).catch(() => null);
  const storeData = await getStore(slug).catch(() => null);
  if (!productRes || !storeData) notFound();
  const { product } = productRes;

  const { products } = await getStoreProducts(slug).catch(
    (): { products: RawPaginated<Product> } => ({
      products: emptyPaginated<Product>(),
    }),
  );

  return (
    <ProductPage
      store={storeData.store}
      verified={Boolean(storeData.account?.verified)}
      product={product}
      products={products.data ?? []}
    />
  );
}
