import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@katenda_clients/ui/select";

export function PhoneField({
  code,
  number,
  onChange,
  callingCodes,
  label,
  numberPlaceholder,
  numberMaxLength = 20,
}: {
  code: string;
  number: string;
  onChange: (code: string, number: string) => void;
  callingCodes: string[];
  label: string;
  numberPlaceholder?: string;
  numberMaxLength?: number;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-1.5">{label}</p>
      <div className="flex items-center h-12 rounded-2xl bg-surface border border-border overflow-hidden">
        <Select value={code} onValueChange={(v) => onChange(v, number)}>
          <SelectTrigger className="w-24 h-full rounded-none bg-surface border-0 border-r border-border">
            <SelectValue placeholder="+" />
          </SelectTrigger>
          <SelectContent>
            {callingCodes.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          value={number}
          onChange={(e) => onChange(code, e.target.value)}
          placeholder={numberPlaceholder}
          maxLength={numberMaxLength}
          inputMode="tel"
          className="flex-1 h-full bg-transparent outline-none text-sm px-3 tabular-nums"
        />
      </div>
    </div>
  );
}
