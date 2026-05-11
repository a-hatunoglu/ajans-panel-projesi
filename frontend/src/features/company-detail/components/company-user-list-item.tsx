"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { CompanyUserItem } from "../types";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import { UserAvatar } from "@/components/shared/user-avatar";

interface CompanyUserListItemProps {
  member: CompanyUserItem;
  canEdit?: boolean;
  onEdit?: (member: CompanyUserItem) => void;
  onRemove?: (member: CompanyUserItem) => void;
}

function getRoleBadge(role: import("../types").CompanyMemberRole, label: string) {
  switch (role) {
    case "platform_owner":
      return (
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          {label}
        </span>
      );
    case "user":
      return (
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
          {label}
        </span>
      );
    case "editor":
      return (
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
          {label}
        </span>
      );
    case "designer":
      return (
        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400">
          {label}
        </span>
      );
    case "client":
      return (
        <span className="rounded-full border border-zinc-700/50 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {label}
        </span>
      );
  }
}

function getActivityBadge(isActive: boolean, label: string) {
  if (isActive) {
    return (
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
        {label}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-zinc-700/50 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
      {label}
    </span>
  );
}

export function CompanyUserListItem({
  member,
  canEdit = false,
  onEdit,
  onRemove,
}: CompanyUserListItemProps) {
  const { t } = useI18n();
  const { getUserActivityLabel, getUserRoleLabel } = useLabels();
  const globalRoleLabel = getUserRoleLabel(member.globalRole);
  const activityLabel = getUserActivityLabel(member.isActive);

  // Platform owner cannot be edited via this endpoint
  const showActions = canEdit && member.globalRole !== "platform_owner";

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between group hover:bg-white/5 transition-colors">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          avatarUrl={member.avatarUrl}
          name={member.name}
          email={member.email}
          size="md"
        />

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-zinc-100">
            {member.name}
          </div>
          <div className="truncate text-xs text-zinc-500">{member.email}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {member.roles.length > 0 ? (
          member.roles.map((r) => {
            const roleKey = r as import("../types").CompanyMemberRole;
            return (
              <div key={r}>
                {getRoleBadge(roleKey, getUserRoleLabel(roleKey))}
              </div>
            );
          })
        ) : (
          getRoleBadge(member.globalRole, globalRoleLabel)
        )}
        {getActivityBadge(member.isActive, activityLabel)}
        {showActions && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="ml-1 flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-300 sm:ml-2"
          >
            <Pencil className="w-3 h-3" />
            {t("companyDetail.editUser.cta")}
          </button>
        )}
        {showActions && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(member)}
            className="flex items-center gap-1 rounded-md border border-red-500/20 px-2 py-1 text-[11px] font-medium text-red-400/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
