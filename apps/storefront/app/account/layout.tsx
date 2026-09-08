import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSlug } from "@/lib/slug";
import { getStore } from "@/services/storefrontService";
import { AccountShell } from "@/components/account/AccountShell";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const slug = await requireSlug();
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

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = await requireSlug();
  const data = await getStore(slug).catch(() => null);
  if (!data) notFound();

  return (
    <AccountShell store={data.store} account={data.account} slug={slug}>
      {children}
    </AccountShell>
  );
}
