"use client";

import type { CompanyUserItem } from "../types";
import { useLabels } from "@/lib/labels";
import { UserAvatar } from "@/components/shared/user-avatar";

interface CompanyUserListItemProps {
  member: CompanyUserItem;
}

function getRoleBadge(role: CompanyUserItem["role"], label: string) {
  switch (role) {
    case "owner":
      return (
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          {label}
        </span>
      );
    case "admin":
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

export function CompanyUserListItem({ member }: CompanyUserListItemProps) {
  const { getUserActivityLabel, getUserRoleLabel } = useLabels();
  const roleLabel = getUserRoleLabel(member.role);
  const activityLabel = getUserActivityLabel(member.isActive);

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
        {getRoleBadge(member.role, roleLabel)}
        {getActivityBadge(member.isActive, activityLabel)}
      </div>
    </div>
  );
}
