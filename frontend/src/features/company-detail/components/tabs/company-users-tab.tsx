"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Users, UserCog, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/providers/auth-provider"
import { canManageCompanies } from "@/lib/roles";;
import { useCompanyUsers } from "../../api/queries";
import { useRemoveCompanyUserMutation } from "../../api/mutations";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyUserListItem } from "../company-user-list-item";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import type { CompanyUserItem } from "../../types";

const AddCompanyUserDialog = dynamic(
  () => import("../add-company-user-dialog").then((m) => m.AddCompanyUserDialog),
  { ssr: false }
);

const EditUserDialog = dynamic(
  () => import("../edit-user-dialog").then((m) => m.EditUserDialog),
  { ssr: false }
);

const SelfAssignRolesDialog = dynamic(
  () => import("../self-assign-roles-dialog").then((m) => m.SelfAssignRolesDialog),
  { ssr: false }
);

interface CompanyUsersTabProps {
  companyId: string;
}

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const canManage = canManageCompanies(user?.role, user?.agencyRole ?? undefined);
  const { getCompanyMembersLabel } = useLabels();
  const { data, isLoading, isError } = useCompanyUsers(companyId);
  const removeMutation = useRemoveCompanyUserMutation(companyId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUserItem | null>(null);
  const [selfAssignOpen, setSelfAssignOpen] = useState(false);
  const [removingUser, setRemovingUser] = useState<CompanyUserItem | null>(null);

  const handleAddClick = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const handleAddClose = useCallback(() => {
    setAddDialogOpen(false);
  }, []);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removingUser) return;
    try {
      await removeMutation.mutateAsync(removingUser.userId);
      setRemovingUser(null);
    } catch {
      // error handled by mutation state
    }
  }, [removingUser, removeMutation]);

  const isEmpty = !isLoading && !isError && data && data.members.length === 0;

  // Check if current user is a member but has no operational roles
  const selfMember = useMemo(() => {
    if (!user?.id || !data?.members) return null;
    return data.members.find((m) => m.userId === user.id) ?? null;
  }, [user?.id, data?.members]);

  const selfHasNoRoles = selfMember !== null && selfMember.roles.length === 0;

  return (
    <section className="animate-in fade-in duration-500 rounded-xl border border-white/5 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("companyDetail.users.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("companyDetail.users.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && !isError && data ? (
            <div className="text-xs text-zinc-500">
              {getCompanyMembersLabel(data.members.length)}
            </div>
          ) : null}

          {canManage ? (
            <button
              type="button"
              onClick={handleAddClick}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t("companyDetail.users.add.cta")}
            </button>
          ) : null}
        </div>
      </div>

      {/* Self-assign banner — admin is member but has no operational roles */}
      {canManage && selfHasNoRoles ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <UserCog className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">
              {t("companyDetail.users.selfAssign.bannerTitle")}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t("companyDetail.users.selfAssign.bannerDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelfAssignOpen(true)}
            className="h-8 px-3 shrink-0 flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <UserCog className="w-3.5 h-3.5" />
            {t("companyDetail.users.selfAssign.bannerCta")}
          </button>
        </div>
      ) : null}

      {/* Loading */}
      {isLoading ? (
        <CompanyInlineStatePanel message={t("companyDetail.users.loading")} />
      ) : null}

      {/* Error */}
      {!isLoading && isError ? (
        <CompanyInlineStatePanel message={t("companyDetail.users.error")} />
      ) : null}

      {/* Empty — admin CTA */}
      {isEmpty && canManage ? (
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center flex flex-col items-center">
          <div className="h-10 w-10 rounded-lg bg-zinc-800/80 border border-white/5 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-zinc-100">
            {t("companyDetail.users.emptyAdmin.title")}
          </h2>
          <p className="mx-auto max-w-md text-sm text-zinc-500 mb-6">
            {t("companyDetail.users.emptyAdmin.description")}
          </p>
          <button
            type="button"
            onClick={handleAddClick}
            className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("companyDetail.users.add.cta")}
          </button>
        </div>
      ) : null}

      {/* Empty — non-admin */}
      {isEmpty && !canManage ? (
        <CompanyInlineStatePanel message={t("companyDetail.users.empty")} />
      ) : null}

      {/* Populated list */}
      {!isLoading && !isError && data && data.members.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/20">
          {data.members.map((member, index) => (
            <div
              key={member.membershipId}
              className={index === data.members.length - 1 ? "" : "border-b border-white/5"}
            >
              <CompanyUserListItem
                member={member}
                canEdit={canManage}
                onEdit={(m) => setEditingUser(m)}
                onRemove={(m) => setRemovingUser(m)}
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Remove confirmation dialog */}
      {removingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !removeMutation.isPending && setRemovingUser(null)}
          />
          <div className="relative w-full max-w-sm mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-sm font-medium text-zinc-100">
              {t("companyDetail.users.remove.title")}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {t("companyDetail.users.remove.description", { name: removingUser.name })}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemovingUser(null)}
                disabled={removeMutation.isPending}
                className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
              >
                {t("team.form.cancel")}
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirm}
                disabled={removeMutation.isPending}
                className="h-9 px-4 flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {removeMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t("team.confirmRemove.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add user dialog */}
      <AddCompanyUserDialog
        companyId={companyId}
        existingMembers={data?.members ?? []}
        open={addDialogOpen}
        onClose={handleAddClose}
      />

      {/* Edit user dialog */}
      {editingUser ? (
        <EditUserDialog
          companyId={companyId}
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      ) : null}

      {/* Self-assign roles dialog */}
      {selfMember ? (
        <SelfAssignRolesDialog
          companyId={companyId}
          userId={selfMember.userId}
          userName={selfMember.name}
          currentRoles={selfMember.roles}
          open={selfAssignOpen}
          onClose={() => setSelfAssignOpen(false)}
        />
      ) : null}
    </section>
  );
}
