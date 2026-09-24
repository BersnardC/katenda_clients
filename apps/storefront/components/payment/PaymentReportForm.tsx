"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import type { StorePaymentMethod } from "@/lib/customerAuth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunc = (k: any, vars?: Record<string, string | number>) => string;

interface ReportField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  hidden?: boolean;
  placeholder?: string;
  options?: string[];
}

interface InstructionField {
  key: string;
  label: string;
  source?: string;
  hidden?: boolean;
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
  submitting,
  onSubmit,
}: {
  method: StorePaymentMethod;
  total: number;
  accent: string;
  t: TFunc;
  primaryCurrency: string;
  secondaryCurrency: { code: string } | null;
  submitting?: boolean;
  onSubmit: (
    e: React.FormEvent,
    reportData: Record<string, string>,
    files: Record<string, File>,
  ) => void;
}) {
  const storeData = method.data;
  const instructions = method.payment_method?.instructions as Record<string, unknown> | null;
  const instructionFields = (
    (instructions?.fields as InstructionField[] | undefined) ?? []
  ).filter((f) => !f.hidden);
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

  const reportFields: ReportField[] = (
    (
      (method.payment_method?.report_fields as Record<string, unknown> | null)
        ?.fields as ReportField[] | undefined
    ) ?? []
  ).filter((f) => !f.hidden);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const previewsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  // Revoke object URLs al desmontar (el padre usa key={method.id} al cambiar método).
  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, []);

  const handleChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (key: string, file?: File | null) => {
    if (!file) return;
    setPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      return { ...prev, [key]: URL.createObjectURL(file) };
    });
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const removeImage = (key: string) => {
    setPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFiles((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (fileRefs.current[key]) fileRefs.current[key]!.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (submitting) {
      e.preventDefault();
      return;
    }
    const missingImage = reportFields.find(
      (f) => f.type === "image" && f.required && !files[f.key],
    );
    if (missingImage) {
      e.preventDefault();
      return;
    }
    onSubmit(e, fieldValues, files);
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
      {reportFields.map((field) =>
        field.type === "image" ? (
          <div key={field.key}>
            <p className="text-sm font-medium mb-1.5">{field.label}</p>
            <div className="grid grid-cols-3 gap-2">
              {previews[field.key] ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
                  <img
                    src={previews[field.key]}
                    alt={field.label}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(field.key)}
                    className="absolute top-1.5 right-1.5 size-7 grid place-items-center rounded-full bg-background/90 border border-border"
                    aria-label={t("payment.removeImage") ?? "Remove image"}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRefs.current[field.key]?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-border bg-surface grid place-items-center transition hover:border-primary/50"
                >
                  <div className="flex flex-col items-center gap-1 text-center px-2">
                    <div className="size-9 rounded-xl gradient-brand grid place-items-center text-primary-foreground">
                      <Upload className="size-4" />
                    </div>
                    <p className="text-[11px] font-semibold leading-tight">
                      {t("payment.addImage")}
                    </p>
                  </div>
                </button>
              )}
            </div>
            <input
              ref={(el) => {
                fileRefs.current[field.key] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(field.key, e.target.files?.[0])}
            />
            {field.required && !files[field.key] && (
              <p className="text-xs text-destructive mt-1">{field.label} *</p>
            )}
          </div>
        ) : field.type === "select" ? (
          <div key={field.key}>
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
          </div>
        ) : field.type === "textarea" ? (
          <div key={field.key}>
            <textarea
              className={inputCls + " h-20 resize-none"}
              placeholder={field.placeholder ?? field.label}
              required={field.required}
              value={fieldValues[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </div>
        ) : (
          <div key={field.key}>
            <input
              type={field.type}
              className={inputCls}
              placeholder={field.placeholder ?? field.label}
              required={field.required}
              value={fieldValues[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </div>
        ),
      )}

      {/* Nota/green tip del comercio o del catálogo */}
      {hint && (
        <p className="text-xs rounded-2xl bg-success/10 border border-success/30 text-success p-3 flex items-start gap-1.5">
          <Info className="size-4 shrink-0 mt-0.5" />
          <span>{hint}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ backgroundColor: accent }}
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? t("payment.sending") : t("payment.report")}
      </button>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-success" /> {t("payment.secure")}
      </p>
    </form>
  );
}
