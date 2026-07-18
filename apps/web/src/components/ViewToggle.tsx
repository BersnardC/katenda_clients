import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "grid" | "table";

type Props = {
  value: View;
  onChange: (v: View) => void;
};

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex p-0.5 bg-muted rounded-lg">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          value === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("table")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          value === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
