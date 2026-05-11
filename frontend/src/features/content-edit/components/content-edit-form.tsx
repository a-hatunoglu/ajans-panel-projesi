"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useUpdateContentMutation } from "../api/mutations";
import { createContentEditSchema } from "../schema";
import type { ContentEditFormValues } from "../types";
import type { ContentDetailData } from "@/features/content-detail/types";
import { useI18n } from "@/i18n/provider";
import { useLabels } from "@/lib/labels";
import { useUiCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

interface ContentEditFormProps {
  data: ContentDetailData;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  );
}

export function ContentEditForm({ data }: ContentEditFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { getPlatformLabel } = useLabels();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(() => createContentEditSchema(t), [t]);
  const updateContentMutation = useUpdateContentMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContentEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      body: data.body ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: data.title,
      body: data.body ?? "",
    });
  }, [data.body, data.title, reset]);

  const socialAccountLabel = data.socialAccountName
    ? `${getPlatformLabel(data.platform)} - ${data.socialAccountName}`
    : getPlatformLabel(data.platform);

  async function onSubmit(values: ContentEditFormValues) {
    setSubmitError(null);

    try {
      await updateContentMutation.mutateAsync({
        contentId: data.id,
        companyId: data.companyId,
        values: {
          title: values.title.trim(),
          body: values.body.trim() ? values.body.trim() : null,
        },
      });

      router.push(`/app/contents/${data.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("contentEdit.form.submitError"),
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-white/5 bg-zinc-950 p-5 sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-medium text-zinc-100">
          {t("contentEdit.form.cardTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {t("contentEdit.form.cardDescription")}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-white/5 bg-zinc-900/40 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-zinc-200">
            {t("contentEdit.form.contextTitle")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {t("contentEdit.form.contextHint")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label={t("contentEdit.form.company")}
            value={data.companyName || uiCopy.companyUnavailable}
          />
          <ReadOnlyField
            label={t("contentEdit.form.socialAccount")}
            value={socialAccountLabel}
          />
          <ReadOnlyField
            label={t("contentEdit.form.assignedDesigner")}
            value={data.assignedDesigner?.name || uiCopy.unassigned}
          />
          <ReadOnlyField
            label={t("contentEdit.form.assignedEditor")}
            value={data.assignedEditor?.name || uiCopy.unassigned}
          />
        </div>
      </div>

      {submitError && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="text-sm font-medium text-zinc-300" htmlFor="title">
            {t("contentEdit.form.title")}
          </label>
          <input
            id="title"
            type="text"
            placeholder={t("contentEdit.form.titlePlaceholder")}
            className={cn(
              "mt-2 h-10 w-full rounded-md border bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1",
              errors.title ? "border-red-500/50 focus:ring-red-500" : "border-zinc-800 focus:ring-primary"
            )}
            {...register("title")}
            disabled={updateContentMutation.isPending}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300" htmlFor="body">
            {t("contentEdit.form.body")}
          </label>
          <textarea
            id="body"
            rows={10}
            placeholder={t("contentEdit.form.bodyPlaceholder")}
            className={cn(
              "mt-2 w-full rounded-md border bg-zinc-900 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1",
              errors.body ? "border-red-500/50 focus:ring-red-500" : "border-zinc-800 focus:ring-primary"
            )}
            {...register("body")}
            disabled={updateContentMutation.isPending}
          />
          <FieldError message={errors.body?.message} />
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/app/contents/${data.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          {t("contentEdit.form.cancel")}
        </Link>

        <button
          type="submit"
          disabled={updateContentMutation.isPending || !isDirty}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateContentMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {updateContentMutation.isPending
            ? t("contentEdit.form.submitting")
            : t("contentEdit.form.submit")}
        </button>
      </div>
    </form>
  );
}
