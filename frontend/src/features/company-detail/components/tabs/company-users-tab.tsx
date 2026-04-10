"use client";

import { useState, useCallback } from "react";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useCompanyUsers } from "../../api/queries";
import { CompanyInlineStatePanel } from "../company-inline-state-panel";
import { CompanyUserListItem } from "../company-user-list-item";
import { AddCompanyUserDialog } from "../add-company-user-dialog";
import { EditUserDialog } from "../edit-user-dialog";
import { useLabels } from "@/lib/labels";
import { useI18n } from "@/i18n/provider";
import type { CompanyUserItem } from "../../types";

interface CompanyUsersTabProps {
  companyId: string;
}

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role || "guest";
  const canManage = ["owner", "admin"].includes(role);
  const { getCompanyMembersLabel } = useLabels();
  const { data, isLoading, isError } = useCompanyUsers(companyId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUserItem | null>(null);

  const handleAddClick = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const handleAddClose = useCallback(() => {
    setAddDialogOpen(false);
  }, []);

  const isEmpty = !isLoading && !isError && data && data.members.length === 0;

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
          {!isLoading && !isError && data && (
            <div className="text-xs text-zinc-500">
              {getCompanyMembersLabel(data.members.length)}
            </div>
          )}

          {canManage && (
            <button
              type="button"
              onClick={handleAddClick}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t("companyDetail.users.add.cta")}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <CompanyInlineStatePanel message={t("companyDetail.users.loading")} />
      )}

      {/* Error */}
      {!isLoading && isError && (
        <CompanyInlineStatePanel message={t("companyDetail.users.error")} />
      )}

      {/* Empty — admin CTA */}
      {isEmpty && canManage && (
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
      )}

      {/* Empty — non-admin */}
      {isEmpty && !canManage && (
        <CompanyInlineStatePanel message={t("companyDetail.users.empty")} />
      )}

      {/* Populated list */}
      {!isLoading && !isError && data && data.members.length > 0 && (
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
              />
            </div>
          ))}
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
      {editingUser && (
        <EditUserDialog
          companyId={companyId}
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </section>
  );
}
