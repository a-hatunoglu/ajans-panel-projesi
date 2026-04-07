"use client";

import { useEffect, useState } from "react";
import { useCompanyActivity } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyActivityListItem } from "../company-activity-list-item";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useI18n } from "@/i18n/provider";

interface CompanyActivityTabProps {
  companyId: string;
}

export function CompanyActivityTab({ companyId }: CompanyActivityTabProps) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useCompanyActivity(
    companyId,
    page,
  );

  useEffect(() => {
    setPage(1);
  }, [companyId]);

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-200">
          {t("companyDetail.activity.title")}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {t("companyDetail.activity.description")}
        </p>
      </div>

      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.activity.loading")} />
      )}

      {isError && (
        <CompanyInlineStatePanel
          message={t("companyDetail.activity.error")}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <CompanyInlineStatePanel message={t("companyDetail.activity.empty")} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className={index === data.items.length - 1 ? "" : "border-b border-white/5"}
            >
              <CompanyActivityListItem item={item} />
            </div>
          ))}

          <div className="border-t border-white/5">
            <ContentsPagination
              meta={data.meta}
              isFetching={isFetching}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </section>
  );
}
