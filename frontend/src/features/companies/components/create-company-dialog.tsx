"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Building2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useCreateCompanyMutation } from "@/features/companies/api/mutations";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required.").max(200),
  website: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email("Enter a valid email.").or(z.literal("")).optional(),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

interface CreateCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (companyId: string) => void;
}

export function CreateCompanyDialog({
  open,
  onClose,
  onSuccess,
}: CreateCompanyDialogProps) {
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useCreateCompanyMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: "", website: "", phone: "", email: "" },
  });

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    reset();
    setSubmitError(null);
    onClose();
  }, [mutation.isPending, reset, onClose]);

  const onSubmit = async (data: CreateCompanyForm) => {
    setSubmitError(null);

    try {
      const payload = {
        name: data.name,
        website: data.website || null,
        phone: data.phone || null,
        email: data.email || null,
      };

      const response = await mutation.mutateAsync(payload);
      reset();
      onSuccess(response.data.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("companies.create.submitError");
      setSubmitError(message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("companies.create.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {t("companies.create.description")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          {/* Name (required) */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-name"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companies.create.form.name")} *
            </label>
            <input
              id="company-name"
              type="text"
              autoFocus
              disabled={mutation.isPending}
              placeholder={t("companies.create.form.namePlaceholder")}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-email"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companies.create.form.email")}
            </label>
            <input
              id="company-email"
              type="email"
              disabled={mutation.isPending}
              placeholder={t("companies.create.form.emailPlaceholder")}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-website"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companies.create.form.website")}
            </label>
            <input
              id="company-website"
              type="text"
              disabled={mutation.isPending}
              placeholder={t("companies.create.form.websitePlaceholder")}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              {...register("website")}
            />
            {errors.website && (
              <span className="text-xs text-red-500">
                {errors.website.message}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-phone"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companies.create.form.phone")}
            </label>
            <input
              id="company-phone"
              type="text"
              disabled={mutation.isPending}
              placeholder={t("companies.create.form.phonePlaceholder")}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              {...register("phone")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {t("companies.create.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("companies.create.form.submitting")}
                </>
              ) : (
                t("companies.create.form.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
