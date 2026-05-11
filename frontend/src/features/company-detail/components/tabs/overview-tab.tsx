 "use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { CompanyDetailData } from "../../types";
import { CompanyWorkflowSnapshot } from "../company-workflow-snapshot";
import { EditCompanyDialog } from "../edit-company-dialog";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useAuth } from "@/providers/auth-provider";
import { canManageCompanies } from "@/lib/roles";
import { useI18n } from "@/i18n/provider";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/5 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="max-w-[65%] text-right text-sm text-zinc-200">{value}</span>
    </div>
  );
}

export function OverviewTab({ data }: { data: CompanyDetailData }) {
  const { t } = useI18n();
  const uiCopy = useUiCopy();
  const { user } = useAuth();
  const { getCompanyStatusLabel } = useLabels();
  const notProvided = uiCopy.notProvided;
  const canManage = canManageCompanies(user?.role, user?.agencyRole ?? undefined);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
          <div className="text-sm font-medium text-zinc-400">{t("companyDetail.overview.status")}</div>
          <div className="mt-2 text-2xl font-medium text-zinc-100">
            {getCompanyStatusLabel(data.isActive)}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
          <div className="text-sm font-medium text-zinc-400">{t("companyDetail.overview.socialAccountsConnected")}</div>
          <div className="mt-2 text-2xl font-medium text-zinc-100">
            {data.socialAccountsConnected}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/5 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-200">{t("companyDetail.overview.companyInformation")}</h3>
            {canManage && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                <Pencil className="w-3 h-3" />
                {t("companyDetail.edit.cta")}
              </button>
            )}
          </div>
          <div>
            <DetailRow label={t("companyDetail.overview.fields.slug")} value={data.slug || notProvided} />
            <DetailRow label={t("companyDetail.overview.fields.website")} value={data.website || notProvided} />
            <DetailRow label={t("companyDetail.overview.fields.email")} value={data.email || notProvided} />
            <DetailRow label={t("companyDetail.overview.fields.phone")} value={data.phone || notProvided} />
            <DetailRow label={t("companyDetail.overview.fields.address")} value={data.address || notProvided} />
          </div>
        </section>

        <section className="rounded-xl border border-white/5 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-200">{t("companyDetail.overview.notes")}</h3>
          </div>
          <div className="min-h-[180px] rounded-lg border border-dashed border-white/5 bg-zinc-900/10 p-4">
            <p className="text-sm leading-6 text-zinc-300">
              {data.notes || t("companyDetail.overview.noNotes")}
            </p>
          </div>
        </section>
      </div>

      <CompanyWorkflowSnapshot companyId={data.id} />

      <EditCompanyDialog
        company={data}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}

