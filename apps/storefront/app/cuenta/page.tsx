import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/services/storefrontService";
import { requireSlug } from "@/lib/slug";
import { CustomerAccountPage } from "@/components/account/CustomerAccountPage";

interface Props {
  searchParams: Promise<{ slug?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const slug = await requireSlug(sp.slug);
  try {
    const { store } = await getStore(slug);
    return {
      title: `Mi cuenta — ${store.name}`,
      description: `Inicia sesión en ${store.name} para ver tus pedidos y editar tu perfil.`,
      robots: { index: false },
    };
  } catch {
    return { title: "Mi cuenta", robots: { index: false } };
  }
}

export default async function CustomerAccountRoute({ searchParams }: Props) {
  const sp = await searchParams;
  const slug = await requireSlug(sp.slug);

  const data = await getStore(slug).catch(() => null);
  if (!data) notFound();

  return <CustomerAccountPage storeName={data.store.name} slug={slug} />;
}
