"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";

const urlField = z.string().url("Must be a valid URL").or(z.literal("")).optional();
const strField = z.string().optional();
const materialStatus = z.enum(["ADDED", "NOT_RECEIVED_YET", "NOT_REQUIRED", "REQUEST_FROM_OTT", ""]).optional();

const schema = z.object({
  titleName: z.string().min(1, "Required"),
  contentType: z.enum(["EXCLUSIVE", "MOVIES", "SERIES", "ORIGINAL", ""]).optional(),
  portfolio: z.string().min(1, "Required"),
  project: z.string().min(1, "Required"),
  titleId: strField,
  kpId: strField,
  description: strField,

  folderLink: urlField,
  adminPanelLink: urlField,
  figmaLink: urlField,
  sourceLink: urlField,
  performanceCopiesLink: urlField,
  digitalCopiesLink: urlField,
  copyDeckLink: urlField,

  arabicTitle: strField,
  arabicDescription: strField,
  arabicShortCopy: strField,
  arabicMarketingCopy: strField,
  arabicNotes: strField,

  rightholder: strField,
  year: strField,
  restrictionAge: strField,
  genres: strField,
  countries: strField,

  mainPosterStatus: materialStatus,
  characterPostersStatus: materialStatus,
  trailerStatus: materialStatus,
  teaserStatus: materialStatus,
  episodesStatus: materialStatus,
  highlightsNotes: strField,
});

type FormValues = z.infer<typeof schema>;

interface EntryFormProps {
  initialValues?: Partial<FormValues>;
  entryId?: string;
  mode: "create" | "edit";
}

const CONTENT_TYPE_OPTIONS = [
  { value: "EXCLUSIVE", label: "Exclusive" },
  { value: "MOVIES", label: "Movies" },
  { value: "SERIES", label: "Series" },
  { value: "ORIGINAL", label: "Original" },
];

const RESTRICTION_AGE_OPTIONS = [
  { value: "0+", label: "0+" },
  { value: "6+", label: "6+" },
  { value: "12+", label: "12+" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+" },
];

const MATERIAL_STATUS_OPTIONS = [
  { value: "ADDED", label: "Added" },
  { value: "NOT_RECEIVED_YET", label: "Not Received Yet" },
  { value: "NOT_REQUIRED", label: "Not Required" },
  { value: "REQUEST_FROM_OTT", label: "Request From OTT" },
];

const HIGHLIGHT_ROWS = [
  { field: "mainPosterStatus", label: "Main Poster" },
  { field: "characterPostersStatus", label: "Character Posters" },
  { field: "trailerStatus", label: "Trailer" },
  { field: "teaserStatus", label: "Teaser" },
  { field: "episodesStatus", label: "Episodes" },
] as const;

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-neutral-100" />
    </div>
  );
}

export function EntryForm({ initialValues, entryId, mode }: EntryFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: FormValues) => {
    setError("");
    const url = mode === "create" ? "/api/entries" : `/api/entries/${entryId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    // clean empty strings → null for optional fields
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
    );

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }

    const entry = await res.json();
    router.push(`/entries/${mode === "create" ? entry.id : entryId}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      {/* ── Basic Info ── */}
      <SectionHeader title="Basic Info" />
      <Input
        label="Title Name *"
        placeholder="e.g. One Piece — Elbaph Arc"
        error={errors.titleName?.message}
        {...register("titleName")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Controller
          name="contentType"
          control={control}
          render={({ field }) => (
            <Select
              label="Content Type"
              options={CONTENT_TYPE_OPTIONS}
              placeholder="Select type..."
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
        <Input
          label="Portfolio"
          placeholder="https://..."
          error={errors.portfolio?.message}
          {...register("portfolio")}
        />
        <Input
          label="Project"
          placeholder="https://..."
          error={errors.project?.message}
          {...register("project")}
        />
      </div>
      <Textarea
        label="Description"
        placeholder="Brief description..."
        {...register("description")}
      />

      {/* ── IDs ── */}
      <SectionHeader title="IDs" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title ID" placeholder="e.g. 12345" {...register("titleId")} />
        <Input label="KP ID" placeholder="e.g. KP-9876" {...register("kpId")} />
      </div>

      {/* ── Links ── */}
      <SectionHeader title="Links" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Figma" placeholder="https://figma.com/..." error={errors.figmaLink?.message} {...register("figmaLink")} />
        <Input label="Source" placeholder="https://..." error={errors.sourceLink?.message} {...register("sourceLink")} />
        <Input label="Folder" placeholder="https://drive.google.com/..." error={errors.folderLink?.message} {...register("folderLink")} />
        <Input label="Admin Panel" placeholder="https://admin..." error={errors.adminPanelLink?.message} {...register("adminPanelLink")} />
        <Input label="Performance Copies" placeholder="https://..." error={errors.performanceCopiesLink?.message} {...register("performanceCopiesLink")} />
        <Input label="Digital Copies" placeholder="https://..." error={errors.digitalCopiesLink?.message} {...register("digitalCopiesLink")} />
        <Input label="Copy Deck" placeholder="https://..." error={errors.copyDeckLink?.message} {...register("copyDeckLink")} />
      </div>

      {/* ── Arabic Texts ── */}
      <SectionHeader title="Arabic Texts" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Arabic Title" placeholder="العنوان بالعربية" dir="rtl" {...register("arabicTitle")} />
        <Input label="Arabic Short Copy" placeholder="نسخة قصيرة" dir="rtl" {...register("arabicShortCopy")} />
      </div>
      <Textarea label="Arabic Description" placeholder="الوصف بالعربية" dir="rtl" {...register("arabicDescription")} />
      <Textarea label="Arabic Marketing Copy" placeholder="النسخة التسويقية" dir="rtl" {...register("arabicMarketingCopy")} />
      <Textarea label="Arabic Notes" placeholder="ملاحظات..." dir="rtl" {...register("arabicNotes")} />

      {/* ── Metadata ── */}
      <SectionHeader title="Title Metadata" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="Rightholder" placeholder="e.g. Toei Animation" {...register("rightholder")} />
        <Input label="Year" placeholder="e.g. 2024" type="number" {...register("year")} />
        <Controller
          name="restrictionAge"
          control={control}
          render={({ field }) => (
            <Select
              label="Age Restriction"
              options={RESTRICTION_AGE_OPTIONS}
              placeholder="Select..."
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
        <Input label="Genres" placeholder="e.g. Action, Comedy" {...register("genres")} />
        <Input label="Countries" placeholder="e.g. Japan, US" {...register("countries")} />
      </div>

      {/* ── Highlights Material ── */}
      <SectionHeader title="Highlights Material" />
      <div className="rounded-xl border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide w-1/2">Material</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {HIGHLIGHT_ROWS.map(({ field, label }, i) => (
              <tr key={field} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                <td className="px-4 py-2.5 font-medium text-neutral-700">{label}</td>
                <td className="px-4 py-2.5">
                  <Controller
                    name={field}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        options={MATERIAL_STATUS_OPTIONS}
                        placeholder="— not set —"
                        value={f.value ?? ""}
                        onChange={f.onChange}
                        className="w-full"
                      />
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Textarea label="Highlights Notes" placeholder="Additional notes about materials..." {...register("highlightsNotes")} />

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} size="lg">
          {mode === "create" ? "Create Entry" : "Save Changes"}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
