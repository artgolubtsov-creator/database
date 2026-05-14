"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  link: z.string().optional(),
  category: z.enum(["GUIDE", "LOGO", "PRESENTATION", "ACTIVE_OFFER"]),
  owner: z.string().optional(),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORY_OPTIONS = [
  { value: "GUIDE", label: "Guide" },
  { value: "LOGO", label: "Logo" },
  { value: "PRESENTATION", label: "Presentation" },
  { value: "ACTIVE_OFFER", label: "Active Offer" },
];

interface Props {
  mode: "create" | "edit";
  materialId?: string;
  initialValues?: Partial<FormValues>;
}

export function BrandMaterialForm({ mode, materialId, initialValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      category: "GUIDE",
      owner: "",
      isPublic: true,
      ...initialValues,
    },
  });

  const isPublic = watch("isPublic");

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const url = mode === "create" ? "/api/brand-materials" : `/api/brand-materials/${materialId}`;
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

    router.push("/admin/brand-materials");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input label="Title" {...register("title")} error={errors.title?.message} />
      <Textarea label="Description" rows={3} {...register("description")} />
      <Input label="Link (URL)" type="url" {...register("link")} error={errors.link?.message} />
      <Select label="Category" options={CATEGORY_OPTIONS} {...register("category")} error={errors.category?.message} />
      <Input label="Owner" {...register("owner")} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Visibility</label>
        <button
          type="button"
          onClick={() => setValue("isPublic", !isPublic)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all w-fit ${
            isPublic
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-neutral-200 bg-neutral-50 text-neutral-500"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isPublic ? "bg-emerald-500" : "bg-neutral-400"}`} />
          {isPublic ? "Public" : "Private"}
        </button>
      </div>
      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (mode === "create" ? "Creating…" : "Saving…") : (mode === "create" ? "Create Material" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}
