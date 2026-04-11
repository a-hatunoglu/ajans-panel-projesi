"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, CreditCard } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useCreatePayment } from "@/features/payments/api/mutations";
import { usePaymentCompanies } from "@/features/payments/api/queries";

function createPaymentSchema(t: (key: string) => string) {
  return z.object({
    companyId: z.string().min(1, t("payments.create.validation.companyRequired")),
    amount: z.number().positive(t("payments.create.validation.amountPositive")),
    currency: z.string().length(3, t("payments.create.validation.currencyLength")),
    dueDate: z.string().min(1, t("payments.create.validation.dueDateRequired")),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    notes: z.string().optional(),
  });
}

type CreatePaymentForm = z.infer<ReturnType<typeof createPaymentSchema>>;

interface CreatePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fixedCompany?: { id: string; name: string };
}

export function CreatePaymentDialog({
  open,
  onClose,
  onSuccess,
  fixedCompany,
}: CreatePaymentDialogProps) {
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useCreatePayment();
  const { data: companyOptions = [], isLoading: isCompaniesLoading } =
    usePaymentCompanies(open && !fixedCompany);

  const schema = useMemo(() => createPaymentSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePaymentForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: "",
      amount: undefined,
      currency: "TRY",
      dueDate: "",
      periodStart: "",
      periodEnd: "",
      notes: "",
    },
  });

  // Automatically set companyId if fixedCompany is provided
  useMemo(() => {
    if (fixedCompany && open) {
      reset((prev) => ({ ...prev, companyId: fixedCompany.id }));
    }
  }, [fixedCompany, open, reset]);

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    reset();
    setSubmitError(null);
    onClose();
  }, [mutation.isPending, reset, onClose]);

  const onSubmit = async (data: CreatePaymentForm) => {
    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        companyId: data.companyId,
        amount: data.amount,
        currency: data.currency,
        dueDate: data.dueDate,
        periodStart: data.periodStart || undefined,
        periodEnd: data.periodEnd || undefined,
        notes: data.notes || undefined,
      });
      reset();
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("payments.create.submitError");
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
              <CreditCard className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("payments.create.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {t("payments.create.description")}
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

          {/* Company (required) */}
          <div className="space-y-1.5">
            <label
              htmlFor="payment-company"
              className="text-xs font-medium text-zinc-300"
            >
              {t("payments.create.form.company")} *
            </label>
            {fixedCompany ? (
              <>
                <div className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400">
                  {fixedCompany.name}
                </div>
                <input type="hidden" {...register("companyId")} />
              </>
            ) : (
              <select
                id="payment-company"
                disabled={mutation.isPending || isCompaniesLoading}
                className={inputClassName}
                {...register("companyId")}
              >
                <option value="">
                  {isCompaniesLoading
                    ? t("payments.create.form.companiesLoading")
                    : t("payments.create.form.companyPlaceholder")}
                </option>
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
            {errors.companyId && (
              <span className="text-xs text-red-500">
                {errors.companyId.message}
              </span>
            )}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label
                htmlFor="payment-amount"
                className="text-xs font-medium text-zinc-300"
              >
                {t("payments.create.form.amount")} *
              </label>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                disabled={mutation.isPending}
                placeholder="0.00"
                className={inputClassName}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <span className="text-xs text-red-500">
                  {errors.amount.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="payment-currency"
                className="text-xs font-medium text-zinc-300"
              >
                {t("payments.create.form.currency")}
              </label>
              <input
                id="payment-currency"
                type="text"
                maxLength={3}
                disabled={mutation.isPending}
                className={inputClassName}
                {...register("currency")}
              />
              {errors.currency && (
                <span className="text-xs text-red-500">
                  {errors.currency.message}
                </span>
              )}
            </div>
          </div>

          {/* Due Date (required) */}
          <div className="space-y-1.5">
            <label
              htmlFor="payment-due-date"
              className="text-xs font-medium text-zinc-300"
            >
              {t("payments.create.form.dueDate")} *
            </label>
            <input
              id="payment-due-date"
              type="date"
              disabled={mutation.isPending}
              className={inputClassName}
              {...register("dueDate")}
            />
            {errors.dueDate && (
              <span className="text-xs text-red-500">
                {errors.dueDate.message}
              </span>
            )}
          </div>

          {/* Period Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="payment-period-start"
                className="text-xs font-medium text-zinc-300"
              >
                {t("payments.create.form.periodStart")}
              </label>
              <input
                id="payment-period-start"
                type="date"
                disabled={mutation.isPending}
                className={inputClassName}
                {...register("periodStart")}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="payment-period-end"
                className="text-xs font-medium text-zinc-300"
              >
                {t("payments.create.form.periodEnd")}
              </label>
              <input
                id="payment-period-end"
                type="date"
                disabled={mutation.isPending}
                className={inputClassName}
                {...register("periodEnd")}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="payment-notes"
              className="text-xs font-medium text-zinc-300"
            >
              {t("payments.create.form.notes")}
            </label>
            <textarea
              id="payment-notes"
              rows={2}
              disabled={mutation.isPending}
              placeholder={t("payments.create.form.notesPlaceholder")}
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
              {t("payments.create.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-4 flex items-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("payments.create.form.submitting")}
                </>
              ) : (
                t("payments.create.form.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
