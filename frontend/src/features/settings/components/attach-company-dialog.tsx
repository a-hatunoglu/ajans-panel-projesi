"use client";

import { useI18n } from "@/i18n/provider";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { SystemUserItem } from "@/features/settings/api/queries";
import { useCompanies } from "@/features/companies/api/queries";

export function AttachCompanyDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  user: SystemUserItem;
}) {
  const { t } = useI18n();
  const { data: companiesResp, isLoading: companiesLoading } = useCompanies();

  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["editor"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);

  const companies = companiesResp || [];

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  useEffect(() => {
    if (open) {
      setSelectedCompany("");
      setSelectedRoles(["editor"]);
      setErrorDesc(null);
    }
  }, [open]);

  const onSubmit = async () => {
    if (!selectedCompany) {
      setErrorDesc(t("settings.users.validation.selectCompany"));
      return;
    }
    if (selectedRoles.length === 0) {
      setErrorDesc(t("settings.users.validation.selectRole"));
      return;
    }
    
    setIsSubmitting(true);
    setErrorDesc(null);
    try {
      const resp = await fetch(`/api/v1/companies/${selectedCompany}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, roles: selectedRoles }),
      });
      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to attach user");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorDesc(err.message);
      } else {
        setErrorDesc(String(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-[425px] rounded-lg border border-white/10 bg-zinc-950 shadow-lg flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">{t("settings.users.attachTitle")}</h2>
          <button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">
              {t("settings.users.selectCompany")}
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              disabled={companiesLoading}
            >
              <option value="">{t("common.select")}</option>
              {companies.map((c: { id: string; name: string; }) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {companiesLoading && <p className="text-xs text-zinc-500 mt-1">Loading...</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">
              {t("settings.users.selectRoles")}
            </label>
            <div className="flex flex-col gap-2 mt-2">
              {["editor", "designer", "client"].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r)}
                    onChange={() => toggleRole(r)}
                    className="h-4 w-4 rounded border-white/10 bg-zinc-900/50 accent-white"
                  />
                  <span className="text-sm text-zinc-200 capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {errorDesc && (
            <p className="text-sm text-red-500 font-medium">{errorDesc}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button 
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
