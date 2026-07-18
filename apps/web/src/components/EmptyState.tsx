import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted grid place-items-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
