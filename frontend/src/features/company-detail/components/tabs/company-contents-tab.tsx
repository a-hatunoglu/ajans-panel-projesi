"use client";

import { useEffect, useState } from "react";
import { useCompanyContents } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyContentsListItem } from "../company-contents-list-item";
import { ContentsPagination } from "@/features/contents/components/contents-pagination";
import { useI18n } from "@/i18n/provider";

interface CompanyContentsTabProps {
  companyId: string;
}

export function CompanyContentsTab({ companyId }: CompanyContentsTabProps) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useCompanyContents(companyId, page);

  useEffect(() => {
    setPage(1);
  }, [companyId]);

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-200">
          {t("companyDetail.contents.title")}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {t("companyDetail.contents.description")}
        </p>
      </div>

      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.contents.loading")} />
      )}

      {isError && (
        <CompanyInlineStatePanel
          message={t("companyDetail.contents.error")}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <CompanyInlineStatePanel message={t("companyDetail.contents.empty")} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className={index === data.items.length - 1 ? "" : "border-b border-white/5"}
            >
              <CompanyContentsListItem content={item} />
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
