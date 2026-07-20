"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type ComboboxItem = {
  value: string | number;
  label: string;
};

type ComboboxProps = {
  items: ComboboxItem[];
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  clearable?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
};

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      items,
      value,
      onChange,
      placeholder = "Seleccionar...",
      searchPlaceholder = "Buscar...",
      emptyText = "Sin resultados",
      clearable = false,
      clearLabel = "Ninguno",
      disabled = false,
      className,
      popoverClassName,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedLabel = value
      ? items.find((item) => item.value === value)?.label
      : undefined;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !selectedLabel && "text-muted-foreground",
              className,
            )}
          >
            {selectedLabel ?? placeholder}
            <ChevronsUpDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", popoverClassName)}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {clearable && (
                  <CommandItem
                    value=""
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="data-[selected=true]:bg-transparent data-[selected=true]:text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <Check className={cn("h-4 w-4 mr-2", !value ? "opacity-100" : "opacity-0")} />
                    {clearLabel}
                  </CommandItem>
                )}
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="data-[selected=true]:bg-transparent data-[selected=true]:text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <Check className={cn("h-4 w-4 mr-2", value === item.value ? "opacity-100" : "opacity-0")} />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox, type ComboboxItem, type ComboboxProps };
