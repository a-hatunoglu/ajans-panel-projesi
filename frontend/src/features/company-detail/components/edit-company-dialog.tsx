"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useUpdateCompanyMutation } from "../api/mutations";
import type { CompanyDetailData } from "../types";

function editCompanySchema(t: (key: string) => string) {
  return z.object({
    name: z
      .string()
      .min(1, t("companyDetail.edit.validation.nameRequired"))
      .max(200),
    website: z
      .string()
      .url(t("companyDetail.edit.validation.invalidUrl"))
      .or(z.literal(""))
      .optional(),
    phone: z.string().max(30).optional(),
    email: z
      .string()
      .email(t("companyDetail.edit.validation.invalidEmail"))
      .or(z.literal(""))
      .optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  });
}

type EditCompanyForm = z.infer<ReturnType<typeof editCompanySchema>>;

interface EditCompanyDialogProps {
  company: CompanyDetailData;
  open: boolean;
  onClose: () => void;
}

export function EditCompanyDialog({
  company,
  open,
  onClose,
}: EditCompanyDialogProps) {
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useUpdateCompanyMutation(company.id);

  const schema = useMemo(() => editCompanySchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditCompanyForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company.name,
      website: company.website || "",
      phone: company.phone || "",
      email: company.email || "",
      address: company.address || "",
      notes: company.notes || "",
    },
  });

  // Reset form when company data changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: company.name,
        website: company.website || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
        notes: company.notes || "",
      });
      setSubmitError(null);
    }
  }, [open, company, reset]);

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    reset();
    setSubmitError(null);
    onClose();
  }, [mutation.isPending, reset, onClose]);

  const onSubmit = async (data: EditCompanyForm) => {
    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        name: data.name,
        website: data.website || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("companyDetail.edit.submitError");
      setSubmitError(message);
    }
  };

  if (!open) return null;

  const inputClassName =
    "flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50";

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
              <Pencil className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("companyDetail.edit.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {t("companyDetail.edit.description")}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-5">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          {/* Name (required) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-company-name"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.edit.form.name")} *
            </label>
            <input
              id="edit-company-name"
              type="text"
              disabled={mutation.isPending}
              className={inputClassName}
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-company-email"
                className="text-xs font-medium text-zinc-300"
              >
                {t("companyDetail.edit.form.email")}
              </label>
              <input
                id="edit-company-email"
                type="text"
                disabled={mutation.isPending}
                className={inputClassName}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-company-phone"
                className="text-xs font-medium text-zinc-300"
              >
                {t("companyDetail.edit.form.phone")}
              </label>
              <input
                id="edit-company-phone"
                type="text"
                disabled={mutation.isPending}
                className={inputClassName}
                {...register("phone")}
              />
            </div>
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-company-website"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.edit.form.website")}
            </label>
            <input
              id="edit-company-website"
              type="text"
              disabled={mutation.isPending}
              placeholder="https://..."
              className={inputClassName}
              {...register("website")}
            />
            {errors.website && (
              <span className="text-xs text-red-500">
                {errors.website.message}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-company-address"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.edit.form.address")}
            </label>
            <input
              id="edit-company-address"
              type="text"
              disabled={mutation.isPending}
              className={inputClassName}
              {...register("address")}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-company-notes"
              className="text-xs font-medium text-zinc-300"
            >
              {t("companyDetail.edit.form.notes")}
            </label>
            <textarea
              id="edit-company-notes"
              rows={2}
              disabled={mutation.isPending}
              className="flex w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 resize-none"
              {...register("notes")}
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
              {t("companyDetail.edit.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !isDirty}
              className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("companyDetail.edit.form.submitting")}
                </>
              ) : (
                t("companyDetail.edit.form.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
