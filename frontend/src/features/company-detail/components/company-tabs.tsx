"use client";

import { useAuth } from "@/providers/auth-provider";
import { getCompanyTabs } from "../mock-data";
import { TabId } from "../types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

interface CompanyTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function CompanyTabs({ activeTab, onTabChange }: CompanyTabsProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const role = user?.role || "guest";
  const agencyRole = user?.agencyRole;
  const visibleTabs = getCompanyTabs(t).filter(
    (tab) => tab.allowedRoles.includes(role) || (agencyRole && tab.allowedRoles.includes(agencyRole))
  );

  return (
    <div className="border-b border-white/5 overflow-x-auto no-scrollbar mb-8">
      <div className="flex w-full gap-6 px-1">
        {visibleTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabId)}
              className={cn(
                "pb-3 text-sm font-medium transition-all relative whitespace-nowrap outline-none",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
