"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { useCompanyDetail } from "@/features/company-detail/api/queries";
import { CompanyHeader } from "@/features/company-detail/components/company-header";
import { CompanyCalendarTab } from "@/features/company-detail/components/tabs/company-calendar-tab";
import { CompanyActivityTab } from "@/features/company-detail/components/tabs/company-activity-tab";
import { CompanyPaymentsTab } from "@/features/company-detail/components/tabs/company-payments-tab";
import { CompanySocialAccountsTab } from "@/features/company-detail/components/tabs/company-social-accounts-tab";
import { CompanyTabs } from "@/features/company-detail/components/company-tabs";
import { CompanyContentsTab } from "@/features/company-detail/components/tabs/company-contents-tab";
import { CompanyUsersTab } from "@/features/company-detail/components/tabs/company-users-tab";
import { OverviewTab } from "@/features/company-detail/components/tabs/overview-tab";
import { TabId } from "@/features/company-detail/types";
import { useI18n } from "@/i18n/provider";

export default function CompanyDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { data: company, isLoading, isError, error } = useCompanyDetail(companyId);

  if (!companyId) {
    return (
      <PageStatePanel
        title={t("companyDetail.invalidTitle")}
        description={t("companyDetail.invalidDescription")}
        className="max-w-6xl"
      />
    );
  }

  if (isLoading) {
    return (
      <PageStatePanel
        title={t("companyDetail.loadingTitle")}
        description={t("companyDetail.loadingDescription")}
        className="max-w-6xl"
      />
    );
  }

  if (isError || !company) {
    const message =
      error instanceof Error
        ? error.message
        : t("companyDetail.errorDescription");

    return (
      <PageStatePanel
        title={t("companyDetail.errorTitle")}
        description={message}
        className="max-w-6xl"
      />
    );
  }

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12 max-w-6xl">
      <CompanyHeader company={company} />
      <CompanyTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "overview" && <OverviewTab data={company} />}

        {activeTab === "social" && <CompanySocialAccountsTab companyId={company.id} />}
        {activeTab === "contents" && <CompanyContentsTab companyId={company.id} />}
        {activeTab === "calendar" && <CompanyCalendarTab companyId={company.id} />}
        {activeTab === "payments" && <CompanyPaymentsTab companyId={company.id} />}
        {activeTab === "users" && <CompanyUsersTab companyId={company.id} />}
        {activeTab === "activity" && <CompanyActivityTab companyId={company.id} />}
      </div>
    </PageContainer>
  );
}
