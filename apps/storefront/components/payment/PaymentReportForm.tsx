"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import type { StorePaymentMethod } from "@/lib/customerAuth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunc = (k: any, vars?: Record<string, string | number>) => string;

interface ReportField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface InstructionField {
  key: string;
  label: string;
  source?: string;
}

const inputCls =
  "w-full h-11 px-3 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm";

export function PaymentReportForm({
  method,
  total,
  accent,
  t,
  primaryCurrency,
  secondaryCurrency,
  onSubmit,
}: {
  method: StorePaymentMethod;
  total: number;
  accent: string;
  t: TFunc;
  primaryCurrency: string;
  secondaryCurrency: { code: string } | null;
  onSubmit: (e: React.FormEvent, reportData: Record<string, string>) => void;
}) {
  const storeData = method.data;
  const instructions = method.payment_method?.instructions as Record<string, unknown> | null;
  const instructionFields =
    (instructions?.fields as InstructionField[] | undefined) ?? [];
  const labelMap = new Map(instructionFields.map((f) => [f.key, f.label]));
  const banks = method.payment_method?.platform_banks ?? [];

  const hint = method.hint ?? "";

  const formatStoreValue = (key: string, value: string): string => {
    const field = instructionFields.find((f) => f.key === key);
    if (field?.source === "platform_banks") {
      const bank = banks.find((b) => String(b.id) === value);
      return bank?.name ?? value;
    }
    return value;
  };

  const storeEntries: [string, string][] =
    storeData && Object.keys(storeData).length > 0
      ? (instructionFields.length > 0
          ? instructionFields
              .map((f): [string, string] | null => {
                const value = storeData[f.key];
                return value ? [f.key, value] : null;
              })
              .filter((entry): entry is [string, string] => entry !== null)
          : (Object.entries(storeData) as [string, string][])
      ).filter(([, value]) => value)
      : [];

  const reportFields: ReportField[] =
    (
      method.payment_method?.report_fields as Record<string, unknown> | null
    )?.fields as ReportField[] ?? [];

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, fieldValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Monto */}
      <div className="rounded-2xl bg-surface border border-border p-4 text-sm space-y-1">
        <p className="font-semibold">{t("payment.amount")}</p>
        <p className="text-muted-foreground">
          {fmtCurrency(total, primaryCurrency)}
          {secondaryCurrency && (
            <span className="text-xs">
              {" "}
              · ≈ {fmtCurrency(total, secondaryCurrency.code)}
            </span>
          )}
        </p>
      </div>

      {/* Datos del comercio (solo lectura) */}
      {storeEntries.length > 0 && (
        <div className="rounded-2xl bg-surface border border-border p-4 text-sm space-y-1">
          <p className="font-semibold">{t("payment.storeData")}</p>
          {storeEntries.map(([key, value]) => (
            <p key={key} className="text-muted-foreground text-xs">
              <span>{labelMap.get(key) ?? key.replace(/_/g, " ")}:</span>{" "}
              <span className="font-medium text-foreground">
                {formatStoreValue(key, value)}
              </span>
            </p>
          ))}
        </div>
      )}

      {/* Campos dinámicos del reporte */}
      {reportFields.map((field) => (
        <div key={field.key}>
          {field.type === "select" ? (
            <select
              className={inputCls}
              required={field.required}
              value={fieldValues[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            >
              <option value="">{field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              className={inputCls + " h-20 resize-none"}
              placeholder={field.placeholder ?? field.label}
              required={field.required}
              value={fieldValues[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          ) : (
            <input
              type={field.type === "image" ? "file" : field.type}
              accept={field.type === "image" ? "image/*" : undefined}
              className={inputCls}
              placeholder={field.placeholder ?? field.label}
              required={field.required}
              value={field.type === "image" ? undefined : (fieldValues[field.key] ?? "")}
              onChange={(e) =>
                handleChange(
                  field.key,
                  field.type === "image"
                    ? e.target.files?.[0]?.name ?? ""
                    : e.target.value,
                )
              }
            />
          )}
        </div>
      ))}

      {/* Hint del comercio o del catálogo */}
      {hint && (
        <p className="text-xs text-muted-foreground rounded-2xl bg-surface border border-border p-3">
          {hint}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
        style={{ backgroundColor: accent }}
      >
        {t("payment.report")}
      </button>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-success" /> {t("payment.secure")}
      </p>
    </form>
  );
}
