"use client";

import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { RestrictedAccessPanel } from "@/components/shared/restricted-access-panel";
import { useCreateCompanyOptions } from "@/features/content-create/api/queries";
import { ContentCreateForm } from "@/features/content-create/components/content-create-form";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ContentCreatePage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const defaultCompanyId = searchParams.get("company") || undefined;
  const role = user?.role || "guest";
  const companyRoles = user?.companyRoles ?? [];
  const isClientOnly = role === "user" && companyRoles.length > 0 && companyRoles.every((r) => r === "client");
  const canCreate = true /* all authenticated users */ && !isClientOnly;
  const companiesQuery = useCreateCompanyOptions(canCreate && !isAuthLoading);
  const companies = companiesQuery.data ?? [];

  if (isAuthLoading) {
    return (
      <PageStatePanel
        title={t("contentCreate.loadingTitle")}
        description={t("contentCreate.loadingDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (!user || !canCreate) {
    return (
      <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">
            {t("contentCreate.pageTitle")}
          </h1>
          <p className="text-sm text-zinc-400">{t("contentCreate.pageSubtitle")}</p>
        </div>
        <RestrictedAccessPanel description={t("contentCreate.restrictedDescription")} />
      </PageContainer>
    );
  }

  if (companiesQuery.isLoading) {
    return (
      <PageStatePanel
        title={t("contentCreate.loadingTitle")}
        description={t("contentCreate.loadingDescription")}
        className="max-w-5xl"
      />
    );
  }

  if (companiesQuery.isError) {
    const message =
      companiesQuery.error instanceof Error
        ? companiesQuery.error.message
        : t("contentCreate.errorDescription");

    return (
      <PageStatePanel
        title={t("contentCreate.errorTitle")}
        description={message}
        className="max-w-5xl"
      />
    );
  }

  if (companies.length === 0) {
    return (
      <PageStatePanel
        title={t("contentCreate.emptyTitle")}
        description={t("contentCreate.emptyDescription")}
        className="max-w-5xl"
      >
        <Link
          href="/app/companies"
          className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          {t("contentCreate.emptyAction")}
        </Link>
      </PageStatePanel>
    );
  }

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-5xl">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-medium tracking-tight text-white">
          {t("contentCreate.pageTitle")}
        </h1>
        <p className="text-sm text-zinc-400">{t("contentCreate.pageSubtitle")}</p>
      </div>

      <ContentCreateForm
        companies={companies}
        currentUser={{ id: user.id, role: role as import("@/features/content-create/types").CreateEligibleRole }}
        defaultCompanyId={defaultCompanyId}
      />
    </PageContainer>
  );
}
