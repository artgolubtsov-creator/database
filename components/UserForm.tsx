"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const createSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  isActive: z.boolean(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Viewer" },
  { value: "EDITOR", label: "Editor" },
  { value: "ADMIN", label: "Admin" },
];

interface CreateProps {
  mode: "create";
}
interface EditProps {
  mode: "edit";
  userId: string;
  initialValues: EditValues;
}

type Props = CreateProps | EditProps;

export function UserForm(props: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  if (props.mode === "create") {
    return <CreateForm setServerError={setServerError} serverError={serverError} router={router} />;
  }
  return (
    <EditForm
      userId={props.userId}
      initialValues={props.initialValues}
      setServerError={setServerError}
      serverError={serverError}
      router={router}
    />
  );
}

function CreateForm({
  setServerError,
  serverError,
  router,
}: {
  setServerError: (e: string | null) => void;
  serverError: string | null;
  router: ReturnType<typeof useRouter>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "VIEWER" },
  });

  const onSubmit = async (data: CreateValues) => {
    setServerError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json();
      setServerError(j.error ?? "Something went wrong");
      return;
    }
    router.push("/admin/users");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input label="Name" {...register("name")} error={errors.name?.message} />
      <Select
        label="Role"
        options={ROLE_OPTIONS}
        {...register("role")}
        error={errors.role?.message}
      />
      <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create User"}
        </Button>
      </div>
    </form>
  );
}

function EditForm({
  userId,
  initialValues,
  setServerError,
  serverError,
  router,
}: {
  userId: string;
  initialValues: EditValues;
  setServerError: (e: string | null) => void;
  serverError: string | null;
  router: ReturnType<typeof useRouter>;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: initialValues,
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: EditValues) => {
    setServerError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json();
      setServerError(j.error ?? "Something went wrong");
      return;
    }
    router.push("/admin/users");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input label="Name" {...register("name")} error={errors.name?.message} />
      <Select
        label="Role"
        options={ROLE_OPTIONS}
        {...register("role")}
        error={errors.role?.message}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Status</label>
        <button
          type="button"
          onClick={() => setValue("isActive", !isActive)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all w-fit ${
            isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-neutral-200 bg-neutral-50 text-neutral-500"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-neutral-400"}`} />
          {isActive ? "Active" : "Deactivated"}
        </button>
      </div>
      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
