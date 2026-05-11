"use client";

import { useState, useCallback, useMemo } from "react";
import { X, Loader2, Users, Search, ChevronLeft } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import {
  useAddCompanyUserMutation,
  useSystemUsers,
} from "@/features/company-detail/api/mutations";
import type { SystemUser } from "@/features/company-detail/api/mutations";
import type { CompanyUserItem } from "@/features/company-detail/types";
import { useLabels } from "@/lib/labels";
import { InvitePlatformUserDialog } from "./invite-platform-user-dialog";

interface AddCompanyUserDialogProps {
  companyId: string;
  existingMembers: CompanyUserItem[];
  open: boolean;
  onClose: () => void;
}

const OPERATIONAL_ROLES = ["editor", "designer", "client"] as const;

function getInitials(firstName: string, lastName: string, email: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function AddCompanyUserDialog({
  companyId,
  existingMembers,
  open,
  onClose,
}: AddCompanyUserDialogProps) {
  const { t } = useI18n();
  const { getUserRoleLabel } = useLabels();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const mutation = useAddCompanyUserMutation(companyId);
  const { data: allUsers, isLoading: usersLoading, isError: usersError } = useSystemUsers(open);

  const existingUserIds = useMemo(
    () => new Set(existingMembers.map((m) => m.userId)),
    [existingMembers]
  );

  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(
      (user) => !existingUserIds.has(user.id) && user.isActive
    );
  }, [allUsers, existingUserIds]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return availableUsers;
    const q = search.toLowerCase().trim();
    return availableUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(q) ||
        user.firstName.toLowerCase().includes(q) ||
        user.lastName.toLowerCase().includes(q)
    );
  }, [availableUsers, search]);

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    setSubmitError(null);
    setSearch("");
    setSelectedUser(null);
    setSelectedRoles([]);
    onClose();
  }, [mutation.isPending, onClose]);

  const handleUserSelect = useCallback((user: SystemUser) => {
    setSelectedUser(user);
    setSelectedRoles([]);
    setSubmitError(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedUser(null);
    setSelectedRoles([]);
    setSubmitError(null);
  }, []);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedUser || selectedRoles.length === 0) return;
    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        userId: selectedUser.id,
        roles: selectedRoles,
      });
      setSearch("");
      setSelectedUser(null);
      setSelectedRoles([]);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("companyDetail.users.add.submitError");
      setSubmitError(message);
    }
  }, [selectedUser, selectedRoles, mutation, onClose, t]);

  if (!open) return null;

  const roleLabels: Record<string, string> = {
    editor: t("companyDetail.editUser.form.roles.editor"),
    designer: t("companyDetail.editUser.form.roles.designer"),
    client: t("companyDetail.editUser.form.roles.client"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {selectedUser ? (
              <button
                type="button"
                onClick={handleBackToList}
                disabled={mutation.isPending}
                className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-400" />
              </button>
            ) : (
              <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center">
                <Users className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {selectedUser
                  ? t("companyDetail.users.add.roleStepTitle")
                  : t("companyDetail.users.add.title")}
              </h2>
              <p className="text-xs text-zinc-500">
                {selectedUser
                  ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim() || selectedUser.email
                  : t("companyDetail.users.add.description")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-5">
          {submitError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          {/* Step 1: User selection */}
          {!selectedUser && (
            <>
              {/* Search */}
              <div className="pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("companyDetail.users.add.searchPlaceholder")}
                    className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-800 bg-zinc-900 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {usersLoading && (
                <div className="py-8 flex justify-center text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}

              {!usersLoading && usersError && (
                <div className="py-6 text-center text-sm text-red-500">
                  {t("companyDetail.users.add.loadError")}
                </div>
              )}

              {!usersLoading && !usersError && availableUsers.length === 0 && (
                <div className="py-6 text-center text-sm text-zinc-500">
                  {t("companyDetail.users.add.noAvailable")}
                </div>
              )}

              {!usersLoading && !usersError && availableUsers.length > 0 && filteredUsers.length === 0 && (
                <div className="py-6 text-center text-sm text-zinc-500">
                  {t("companyDetail.users.add.noResults")}
                </div>
              )}

              {!usersLoading && !usersError && filteredUsers.length > 0 && (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-white/5 bg-zinc-900/20 divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      disabled={mutation.isPending}
                      onClick={() => handleUserSelect(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
                    >
                      <div className="h-8 w-8 shrink-0 rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center text-xs font-medium text-zinc-300">
                        {getInitials(user.firstName, user.lastName, user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-zinc-100">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="truncate text-xs text-zinc-500">
                          {user.email}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-zinc-700/50 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        {getUserRoleLabel(user.role)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2: Role selection */}
          {selectedUser && (
            <div className="flex flex-col gap-4 pt-4">
              {/* Selected user info */}
              <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-900/30 p-3">
                <div className="h-8 w-8 shrink-0 rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center text-xs font-medium text-zinc-300">
                  {getInitials(selectedUser.firstName, selectedUser.lastName, selectedUser.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-100">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              {/* Role checkboxes */}
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-300">
                  {t("companyDetail.users.add.selectRoles")}
                </p>
                <div className="flex flex-col gap-2">
                  {OPERATIONAL_ROLES.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-900/20 px-4 py-3 cursor-pointer hover:bg-zinc-900/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                        disabled={mutation.isPending}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-zinc-200">
                        {roleLabels[role] || role}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedRoles.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400/80">
                    {t("companyDetail.users.add.rolesRequired")}
                  </p>
                )}
              </div>

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={mutation.isPending || selectedRoles.length === 0}
                className="w-full h-9 flex items-center justify-center gap-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t("companyDetail.users.add.adding")}
                  </>
                ) : (
                  t("companyDetail.users.add.confirm")
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer — only in step 1 */}
        {!selectedUser && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setInviteDialogOpen(true)}
              disabled={mutation.isPending}
              className="text-xs font-medium text-zinc-100 hover:text-white hover:underline transition-colors disabled:opacity-50"
            >
              {t("companyDetail.users.add.inviteCta")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {t("companyDetail.users.add.close")}
            </button>
          </div>
        )}
      </div>

      <InvitePlatformUserDialog
        companyId={companyId}
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onSuccessReturn={() => {
          setInviteDialogOpen(false);
          onClose(); // Automatically close picker as well after success
        }}
      />
    </div>
  );
}
