 "use client";

import { CompanyDetailData } from "../types";
import { useUiCopy } from "@/lib/copy";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";

export function CompanyHeader({ company }: { company: CompanyDetailData }) {
  const uiCopy = useUiCopy();
  const { getCompanyStatusLabel } = useLabels();
  const { t } = useI18n();
  const logoInitial = company.name.charAt(0).toUpperCase();
  const statusLabel = getCompanyStatusLabel(company.isActive);
  const contactItems = [
    { label: t("companyDetail.header.email"), value: company.email, href: company.email ? `mailto:${company.email}` : undefined },
    { label: t("companyDetail.header.website"), value: company.website, href: company.website || undefined },
    { label: t("companyDetail.header.phone"), value: company.phone, href: company.phone ? `tel:${company.phone}` : undefined },
  ];

  return (
    <div className="flex flex-col gap-6 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 border-white/5 bg-zinc-800 shadow-sm">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt={t("companyDetail.header.logoAlt", { name: company.name })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-medium text-zinc-400">
              {logoInitial}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {company.name}
          </h1>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className={`px-2 py-0.5 rounded-full border ${
              company.isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            }`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 self-start rounded-lg border border-white/5 bg-zinc-900/40 p-4 text-sm sm:grid-cols-3 sm:self-center">
        {contactItems.map((item) => (
          <div key={item.label} className="flex min-w-[150px] flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">{item.label}</span>
            {item.href ? (
              <a
                href={item.href}
                target={item.label === t("companyDetail.header.website") ? "_blank" : undefined}
                rel={item.label === t("companyDetail.header.website") ? "noreferrer" : undefined}
                className="break-all text-zinc-200 transition hover:text-white"
              >
                {item.value}
              </a>
            ) : (
              <span className="text-zinc-500">{uiCopy.notProvided}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
