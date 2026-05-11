"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Temporary password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof passwordSchema>;

export default function ForcePasswordPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setGlobalError(null);
    try {
      await apiClient("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      // Navigate to dashboard cleanly after success
      router.push("/app");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGlobalError(err.message);
      } else {
        setGlobalError("Failed to update password");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 bg-[url('/img/grid.svg')] bg-center relative">
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col gap-8 rounded-xl border border-white/10 bg-zinc-950 p-8 shadow-lg relative z-10"
      >
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-6">
            <span className="text-xl font-bold bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">A</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Update Required</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xs mx-auto">
            Your account was provisioned with a temporary password. Please set a secure password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              {...register("currentPassword")}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
              placeholder="Enter your temporary password"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
              placeholder="Minimum 8 characters"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {globalError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-500 text-center">{globalError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Update Password & Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
