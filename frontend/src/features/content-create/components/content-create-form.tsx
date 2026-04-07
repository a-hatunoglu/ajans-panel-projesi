"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useCreateContentMutation } from "../api/mutations";
import {
  useCreateCompanyMemberOptions,
  useCreateSocialAccountOptions,
} from "../api/queries";
import { createContentCreateSchema } from "../schema";
import type {
  ContentCreateCompanyOption,
  ContentCreateFormValues,
  ContentCreateMemberOption,
  CreateCurrentUser,
} from "../types";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";

interface ContentCreateFormProps {
  companies: ContentCreateCompanyOption[];
  currentUser: CreateCurrentUser;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function FieldNote({
  message,
  tone = "muted",
}: {
  message: string;
  tone?: "muted" | "warning";
}) {
  return (
    <p className={tone === "warning" ? "mt-2 text-xs text-amber-300/80" : "mt-2 text-xs text-zinc-500"}>
      {message}
    </p>
  );
}

function getBlockingMessage(
  options: ContentCreateMemberOption[] | { id: string }[],
  isLoading: boolean,
  isError: boolean,
  emptyMessage: string,
  errorMessage: string,
) {
  if (isLoading) {
    return null;
  }

  if (isError) {
    return errorMessage;
  }

  if (options.length === 0) {
    return emptyMessage;
  }

  return null;
}

export function ContentCreateForm({
  companies,
  currentUser,
}: ContentCreateFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { getPlatformLabel } = useLabels();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(() => createContentCreateSchema(t), [t]);
  const previousCompanyIdRef = useRef<string>("");
  const createContentMutation = useCreateContentMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ContentCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: "",
      socialAccountId: "",
      title: "",
      body: "",
      assignedDesignerId: "",
      assignedEditorId: "",
    },
  });

  const selectedCompanyId = watch("companyId");
  const selectedDesignerId = watch("assignedDesignerId");
  const socialAccountsQuery = useCreateSocialAccountOptions(selectedCompanyId, Boolean(selectedCompanyId));
  const membersQuery = useCreateCompanyMemberOptions(selectedCompanyId, Boolean(selectedCompanyId));
  const socialAccounts = useMemo(
    () => socialAccountsQuery.data ?? [],
    [socialAccountsQuery.data],
  );
  const members = useMemo(
    () => membersQuery.data ?? [],
    [membersQuery.data],
  );
  const designerOptions = useMemo(
    () => members.filter((member) => member.isActive && member.role === "designer"),
    [members],
  );
  const editorOptions = useMemo(
    () => members.filter((member) => member.isActive && member.role === "editor"),
    [members],
  );
  const lockedDesigner = currentUser.role === "designer";
  const selectedDesigner = designerOptions.find(
    (option) => option.id === selectedDesignerId,
  ) ?? null;

  useEffect(() => {
    if (companies.length === 0) {
      return;
    }

    const currentCompanyId = getValues("companyId");

    if (!currentCompanyId) {
      setValue("companyId", companies[0].id, { shouldValidate: true });
    }
  }, [companies, getValues, setValue]);

  useEffect(() => {
    if (!selectedCompanyId) {
      previousCompanyIdRef.current = "";
      return;
    }

    if (
      previousCompanyIdRef.current &&
      previousCompanyIdRef.current !== selectedCompanyId
    ) {
      setValue("socialAccountId", "", { shouldValidate: true });
      setValue("assignedDesignerId", "", { shouldValidate: true });
      setValue("assignedEditorId", "", { shouldValidate: true });
    }

    previousCompanyIdRef.current = selectedCompanyId;
  }, [selectedCompanyId, setValue]);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }

    const currentSocialAccountId = getValues("socialAccountId");

    if (currentSocialAccountId && !socialAccounts.some((account) => account.id === currentSocialAccountId)) {
      setValue("socialAccountId", "", { shouldValidate: true });
    }

    if (!currentSocialAccountId && socialAccounts.length === 1) {
      setValue("socialAccountId", socialAccounts[0].id, { shouldValidate: true });
    }
  }, [selectedCompanyId, socialAccounts, getValues, setValue]);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }

    const currentDesignerId = getValues("assignedDesignerId");
    const currentEditorId = getValues("assignedEditorId");
    const selfDesigner = designerOptions.find((option) => option.id === currentUser.id) ?? null;
    const selfEditor = editorOptions.find((option) => option.id === currentUser.id) ?? null;

    if (lockedDesigner) {
      setValue("assignedDesignerId", selfDesigner?.id ?? "", { shouldValidate: true });
    } else {
      if (currentDesignerId && !designerOptions.some((option) => option.id === currentDesignerId)) {
        setValue("assignedDesignerId", "", { shouldValidate: true });
      }

      if (!currentDesignerId && designerOptions.length === 1) {
        setValue("assignedDesignerId", designerOptions[0].id, { shouldValidate: true });
      }
    }

    if (currentEditorId && !editorOptions.some((option) => option.id === currentEditorId)) {
      setValue("assignedEditorId", "", { shouldValidate: true });
    }

    if (!currentEditorId) {
      if (currentUser.role === "editor" && selfEditor) {
        setValue("assignedEditorId", selfEditor.id, { shouldValidate: true });
      } else if (editorOptions.length === 1) {
        setValue("assignedEditorId", editorOptions[0].id, { shouldValidate: true });
      }
    }
  }, [
    currentUser.id,
    currentUser.role,
    designerOptions,
    editorOptions,
    getValues,
    lockedDesigner,
    selectedCompanyId,
    setValue,
  ]);

  const socialAccountsMessage = getBlockingMessage(
    socialAccounts,
    socialAccountsQuery.isLoading,
    socialAccountsQuery.isError,
    t("contentCreate.form.noSocialAccounts"),
    socialAccountsQuery.error instanceof Error
      ? socialAccountsQuery.error.message
      : t("contentCreate.form.socialAccountsError"),
  );

  const designerMessage = getBlockingMessage(
    designerOptions,
    membersQuery.isLoading,
    membersQuery.isError,
    t("contentCreate.form.noDesigners"),
    membersQuery.error instanceof Error
      ? membersQuery.error.message
      : t("contentCreate.form.membersError"),
  );

  const editorMessage = getBlockingMessage(
    editorOptions,
    membersQuery.isLoading,
    membersQuery.isError,
    t("contentCreate.form.noEditors"),
    membersQuery.error instanceof Error
      ? membersQuery.error.message
      : t("contentCreate.form.membersError"),
  );

  const hasBlockingDependency =
    !selectedCompanyId ||
    socialAccountsQuery.isLoading ||
    membersQuery.isLoading ||
    Boolean(socialAccountsMessage) ||
    Boolean(designerMessage) ||
    Boolean(editorMessage);

  async function onSubmit(values: ContentCreateFormValues) {
    setSubmitError(null);

    try {
      const response = await createContentMutation.mutateAsync({
        ...values,
        title: values.title.trim(),
        body: values.body.trim() ? values.body.trim() : null,
      });

      router.push(`/app/contents/${response.data.content.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("contentCreate.form.submitError"),
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
          {t("contentCreate.form.cardTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {t("contentCreate.form.cardDescription")}
        </p>
        <FieldNote message={t("contentCreate.form.dependencyHint")} />
      </div>

      {submitError && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-300" htmlFor="companyId">
            {t("contentCreate.form.company")}
          </label>
          <select
            id="companyId"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("companyId")}
            disabled={createContentMutation.isPending}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.companyId?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300" htmlFor="socialAccountId">
            {t("contentCreate.form.socialAccount")}
          </label>
          <select
            id="socialAccountId"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            {...register("socialAccountId")}
            disabled={!selectedCompanyId || socialAccountsQuery.isLoading || createContentMutation.isPending}
          >
            <option value="">{t("contentCreate.form.selectSocialAccount")}</option>
            {socialAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {getPlatformLabel(account.platform)} - {account.accountName}
              </option>
            ))}
          </select>
          <FieldError message={errors.socialAccountId?.message} />
          {socialAccountsMessage && (
            <FieldNote message={socialAccountsMessage} tone="warning" />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="title">
            {t("contentCreate.form.title")}
          </label>
          <input
            id="title"
            type="text"
            placeholder={t("contentCreate.form.titlePlaceholder")}
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("title")}
            disabled={createContentMutation.isPending}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="body">
            {t("contentCreate.form.body")}
          </label>
          <textarea
            id="body"
            rows={8}
            placeholder={t("contentCreate.form.bodyPlaceholder")}
            className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("body")}
            disabled={createContentMutation.isPending}
          />
          <FieldError message={errors.body?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300">
            {t("contentCreate.form.assignedDesigner")}
          </label>

          {lockedDesigner ? (
            <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100">
              {selectedDesigner?.name || currentUser.id}
            </div>
          ) : (
            <select
              id="assignedDesignerId"
              className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              {...register("assignedDesignerId")}
              disabled={!selectedCompanyId || membersQuery.isLoading || createContentMutation.isPending}
            >
              <option value="">{t("contentCreate.form.selectDesigner")}</option>
              {designerOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          )}

          <FieldError message={errors.assignedDesignerId?.message} />
          {lockedDesigner && (
            <FieldNote message={t("contentCreate.form.designerLockedHint")} />
          )}
          {designerMessage && (
            <FieldNote message={designerMessage} tone="warning" />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300" htmlFor="assignedEditorId">
            {t("contentCreate.form.assignedEditor")}
          </label>
          <select
            id="assignedEditorId"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            {...register("assignedEditorId")}
            disabled={!selectedCompanyId || membersQuery.isLoading || createContentMutation.isPending}
          >
            <option value="">{t("contentCreate.form.selectEditor")}</option>
            {editorOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.assignedEditorId?.message} />
          {currentUser.role === "editor" && !editorMessage && (
            <FieldNote message={t("contentCreate.form.editorPrefillHint")} />
          )}
          {editorMessage && (
            <FieldNote message={editorMessage} tone="warning" />
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/app/contents"
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          {t("contentCreate.form.cancel")}
        </Link>

        <button
          type="submit"
          disabled={createContentMutation.isPending || hasBlockingDependency}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createContentMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {createContentMutation.isPending
            ? t("contentCreate.form.submitting")
            : t("contentCreate.form.submit")}
        </button>
      </div>
    </form>
  );
}
