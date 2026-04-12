"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
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
  const { user } = useAuth();
  const role = user?.role || "guest";
  const canCreate = ["owner", "admin", "editor", "designer"].includes(role);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useCompanyContents(companyId, page);

  useEffect(() => {
    setPage(1);
  }, [companyId]);

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("companyDetail.contents.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("companyDetail.contents.description")}
          </p>
        </div>

        {canCreate && (
          <div className="flex items-center gap-3">
            <Link
              href={`/app/contents/new?company=${companyId}`}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t("companyDetail.contents.createContent")}
            </Link>
          </div>
        )}
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
