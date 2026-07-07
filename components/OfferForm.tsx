"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, OFFER_KINDS, BILLING_PERIODS } from "@/lib/offers/types";
import { Languages } from "lucide-react";

const schema = z.object({
  type:          z.enum(["future", "current", "old"]),
  offerKind:     z.enum(["Music", "Play", "Taxi", "Yasmina", "Plus", "Other"]).optional(),
  billingPeriod: z.enum(["Monthly", "Yearly"]).optional(),
  country:       z.string().min(1, "Country is required"),
  tariff:        z.enum(["Basic", "Premium", "Crunchyroll"]),
  platform:      z.enum(["iOS", "Android", "Native"]),
  offerName:     z.string().min(1, "Offer name is required"),
  date:          z.string().optional(),
  offerValue:    z.string().optional(),
  price:         z.string().optional(),
  duration:      z.string().optional(),
  promoCode:     z.string().optional(),
  description:   z.string().optional(),
  dateFrom:      z.string().optional(),
  dateTo:        z.string().optional(),
  comment:       z.string().optional(),
  status:        z.string().optional(),
  buttonTextEn:  z.string().optional(),
  buttonTextAr:  z.string().optional(),
  disclaimerEn:  z.string().optional(),
  disclaimerAr:  z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS            = [{ value: "future", label: "Future" }, { value: "current", label: "Current" }, { value: "old", label: "Old" }];
const TARIFF_OPTIONS          = [{ value: "Basic", label: "Basic" }, { value: "Premium", label: "Premium" }, { value: "Crunchyroll", label: "Crunchyroll" }];
const PLATFORM_OPTIONS        = [{ value: "iOS", label: "iOS" }, { value: "Android", label: "Android" }, { value: "Native", label: "Native" }];
const COUNTRY_OPTIONS         = COUNTRIES.map(c => ({ value: c, label: c }));
const STATUS_OPTIONS          = ["Planned", "Draft", "Active", "Expired"].map(s => ({ value: s, label: s }));
const KIND_OPTIONS            = OFFER_KINDS.map(k => ({ value: k, label: k }));
const BILLING_PERIOD_OPTIONS  = BILLING_PERIODS.map(p => ({ value: p, label: p }));

interface Props {
  mode: "create" | "edit";
  offerId?: string;
  initialValues?: Partial<FormValues>;
}

export function OfferForm({ mode, offerId, initialValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [translating, setTranslating] = useState<Record<string, boolean>>({});

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "future",
      country: "UAE",
      tariff: "Basic",
      platform: "iOS",
      offerName: "",
      status: "Planned",
      ...initialValues,
    },
  });

  const offerType = watch("type");

  const translate = useCallback(async (sourceField: keyof FormValues, targetField: keyof FormValues) => {
    const text = getValues(sourceField) as string;
    if (!text?.trim()) return;
    setTranslating(t => ({ ...t, [targetField]: true }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction: "en-ar" }),
      });
      const data = await res.json();
      if (data.translation) setValue(targetField, data.translation, { shouldDirty: true });
    } finally {
      setTranslating(t => ({ ...t, [targetField]: false }));
    }
  }, [getValues, setValue]);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const url    = mode === "create" ? "/api/offers" : `/api/offers/${offerId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const j = await res.json();
      setServerError(j.error ?? "Something went wrong");
      return;
    }

    router.push("/admin#offers");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">

      {/* Section: Main */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Main</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" options={TYPE_OPTIONS} {...register("type")} />
          <Select label="Service" options={KIND_OPTIONS} placeholder="— select —" {...register("offerKind")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Country" options={COUNTRY_OPTIONS} {...register("country")} error={errors.country?.message} />
          <Select label="Billing Period" options={BILLING_PERIOD_OPTIONS} placeholder="— select —" {...register("billingPeriod")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tariff" options={TARIFF_OPTIONS} {...register("tariff")} />
          <Select label="Platform" options={PLATFORM_OPTIONS} {...register("platform")} />
        </div>
        <Input label="Offer Name" {...register("offerName")} error={errors.offerName?.message} placeholder="e.g. Play Monthly Basic" />
      </div>

      {/* Section: Offer Details */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Offer Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price" {...register("price")} placeholder="e.g. 29.99 AED" />
          <Input label="Duration" {...register("duration")} placeholder="e.g. 3 months" />
        </div>
        <Input label="Offer Value" {...register("offerValue")} placeholder="e.g. 3 months for price of 1" />
        <Input label="Promo Code" {...register("promoCode")} placeholder="e.g. SUMMER26" />
        <Textarea label="Description" rows={2} {...register("description")} />
      </div>

      {/* Section: Button Copy */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Button Copy</h3>
        <Input label="Button Text (EN)" {...register("buttonTextEn")} placeholder="e.g. Get 3 months for AED 29.99" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Button Text (AR)</span>
            <button
              type="button"
              onClick={() => translate("buttonTextEn", "buttonTextAr")}
              disabled={translating["buttonTextAr"]}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 disabled:opacity-40 transition-colors"
            >
              <Languages size={12} />
              {translating["buttonTextAr"] ? "Translating…" : "Translate EN → AR"}
            </button>
          </div>
          <Input {...register("buttonTextAr")} placeholder="e.g. احصل على 3 أشهر" className="text-right" dir="rtl" />
        </div>
        <Input label="Under Button (EN)" {...register("disclaimerEn")} placeholder="e.g. Then AED 29.99 per month" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Under Button (AR)</span>
            <button
              type="button"
              onClick={() => translate("disclaimerEn", "disclaimerAr")}
              disabled={translating["disclaimerAr"]}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 disabled:opacity-40 transition-colors"
            >
              <Languages size={12} />
              {translating["disclaimerAr"] ? "Translating…" : "Translate EN → AR"}
            </button>
          </div>
          <Input {...register("disclaimerAr")} placeholder="e.g. ثم 29.99 درهم شهرياً" className="text-right" dir="rtl" />
        </div>
      </div>

      {/* Section: Dates & Status */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Dates & Status</h3>
        {offerType === "future" && (
          <Input label="Planned Change Date" type="date" {...register("date")} />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date From" type="date" {...register("dateFrom")} />
          <Input label="Date To" type="date" {...register("dateTo")} />
        </div>
        <Select label="Status" options={STATUS_OPTIONS} placeholder="— select —" {...register("status")} />
        <Textarea label="Comment" rows={2} {...register("comment")} />
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? (mode === "create" ? "Creating…" : "Saving…")
            : (mode === "create" ? "Create Offer" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}
