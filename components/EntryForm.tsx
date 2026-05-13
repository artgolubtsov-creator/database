"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";

const schema = z.object({
  portfolio: z.string().min(1, "Required"),
  project: z.string().min(1, "Required"),
  task: z.string().min(1, "Required"),
  folderLink: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  adminPanelLink: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  titleId: z.string().optional(),
  kpId: z.string().optional(),
  figmaLink: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  sourceLink: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EntryFormProps {
  initialValues?: Partial<FormValues>;
  entryId?: string;
  mode: "create" | "edit";
}

export function EntryForm({ initialValues, entryId, mode }: EntryFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: FormValues) => {
    setError("");
    const url = mode === "create" ? "/api/entries" : `/api/entries/${entryId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Portfolio *" placeholder="e.g. Yango Play" error={errors.portfolio?.message} {...register("portfolio")} />
        <Input label="Project *" placeholder="e.g. One Piece" error={errors.project?.message} {...register("project")} />
      </div>
      <Input label="Task *" placeholder="Task name or description" error={errors.task?.message} {...register("task")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title ID" placeholder="e.g. 12345" {...register("titleId")} />
        <Input label="KP ID" placeholder="e.g. KP-9876" {...register("kpId")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Figma Link" placeholder="https://figma.com/..." error={errors.figmaLink?.message} {...register("figmaLink")} />
        <Input label="Source Link" placeholder="https://..." error={errors.sourceLink?.message} {...register("sourceLink")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Folder Link" placeholder="https://drive.google.com/..." error={errors.folderLink?.message} {...register("folderLink")} />
        <Input label="Admin Panel Link" placeholder="https://admin..." error={errors.adminPanelLink?.message} {...register("adminPanelLink")} />
      </div>
      <Textarea label="Description" placeholder="Brief description of the task..." {...register("description")} />

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
