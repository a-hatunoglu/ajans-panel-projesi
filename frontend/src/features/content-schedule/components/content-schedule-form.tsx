"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useScheduleContentMutation } from "../api/mutations";
import {
  createContentScheduleSchema,
  type ContentScheduleFormValues,
} from "../schema";
import type { ContentDetailData } from "@/features/content-detail/types";
import { useI18n } from "@/i18n/provider";
import { useLabels } from "@/lib/labels";
import { useUiCopy } from "@/lib/copy";

interface ContentScheduleFormProps {
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

function formatDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function ContentScheduleForm({ data }: ContentScheduleFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { getPlatformLabel, getContentStatusLabel } = useLabels();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(() => createContentScheduleSchema(t), [t]);
  const scheduleContentMutation = useScheduleContentMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentScheduleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduledAt: formatDateTimeLocalValue(data.scheduledAt),
    },
  });

  const socialAccountLabel = data.socialAccountName
    ? `${getPlatformLabel(data.platform)} - ${data.socialAccountName}`
    : getPlatformLabel(data.platform);

  async function onSubmit(values: ContentScheduleFormValues) {
    setSubmitError(null);

    try {
      const scheduledAt = new Date(values.scheduledAt);

      if (Number.isNaN(scheduledAt.getTime())) {
        throw new Error(t("contentSchedule.validation.scheduledAtInvalid"));
      }

      await scheduleContentMutation.mutateAsync({
        contentId: data.id,
        companyId: data.companyId,
        scheduledAt: scheduledAt.toISOString(),
      });

      router.push(`/app/contents/${data.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("contentSchedule.form.submitError"),
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
          {t("contentSchedule.form.cardTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {t("contentSchedule.form.cardDescription")}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-white/5 bg-zinc-900/40 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-zinc-200">
            {t("contentSchedule.form.contextTitle")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {t("contentSchedule.form.contextHint")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label={t("contentSchedule.form.company")}
            value={data.companyName || uiCopy.companyUnavailable}
          />
          <ReadOnlyField
            label={t("contentSchedule.form.socialAccount")}
            value={socialAccountLabel}
          />
          <ReadOnlyField
            label={t("contentSchedule.form.assignedDesigner")}
            value={data.assignedDesigner?.name || uiCopy.unassigned}
          />
          <ReadOnlyField
            label={t("contentSchedule.form.assignedEditor")}
            value={data.assignedEditor?.name || uiCopy.unassigned}
          />
          <ReadOnlyField
            label={t("contentSchedule.form.currentStatus")}
            value={getContentStatusLabel(data.status)}
          />
        </div>
      </div>

      {submitError && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <div>
        <label
          className="text-sm font-medium text-zinc-300"
          htmlFor="scheduledAt"
        >
          {t("contentSchedule.form.scheduledAt")}
        </label>
        <input
          id="scheduledAt"
          type="datetime-local"
          className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("scheduledAt")}
          disabled={scheduleContentMutation.isPending}
        />
        <FieldError message={errors.scheduledAt?.message} />
        <p className="mt-2 text-xs text-zinc-500">
          {t("contentSchedule.form.scheduledAtHint")}
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/app/contents/${data.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          {t("contentSchedule.form.cancel")}
        </Link>

        <button
          type="submit"
          disabled={scheduleContentMutation.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {scheduleContentMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {scheduleContentMutation.isPending
            ? t("contentSchedule.form.submitting")
            : t("contentSchedule.form.submit")}
        </button>
      </div>
    </form>
  );
}
