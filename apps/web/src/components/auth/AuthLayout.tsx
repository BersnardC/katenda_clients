import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { MobileShell } from "@/components/MobileShell";

export function AuthLayout({
  title,
  subtitle,
  backTo = "/",
  children,
}: {
  title: string;
  subtitle: string;
  backTo?: string;
  children: ReactNode;
}) {
  return (
    <MobileShell hideNav>
      <div className="min-h-screen flex flex-col px-6 pt-6 pb-10">
        <Link
          to={backTo}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="mt-8">
          <Logo />
          <h1 className="mt-8 font-display font-bold text-3xl">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </MobileShell>
  );
}
