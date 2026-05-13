"use client";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setError("");
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl card-shadow p-8 flex flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center mb-2">
              <span className="text-white text-sm font-bold">YP</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Sign in</h1>
            <p className="text-sm text-neutral-500">Yango Play Content Hub</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={isSubmitting} size="lg" className="mt-1 w-full">
              Sign in
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
