"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Users, Loader2, UserCog, X, MoreHorizontal, Shield, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { canManageCompanies } from "@/lib/roles";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

type AgencyMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  agencyRole: string;
  isActive: boolean;
};

type AgencyDetailResponse = {
  success: boolean;
  data: {
    agency: {
      id: string;
      name: string;
      slug: string;
      users: AgencyMember[];
    };
  };
};

type AddMemberResponse = {
  success: boolean;
  data: { user: { id: string } };
};

// ─── Queries & Mutations ────────────────────────────────────────

function useAgencyTeam(agencyId?: string | null) {
  return useQuery({
    queryKey: ["agency-team", agencyId],
    enabled: Boolean(agencyId),
    queryFn: async () => {
      const response = await apiClient<AgencyDetailResponse>(
        `/agencies/${agencyId}`
      );
      return response.data.agency;
    },
  });
}

function useAddAgencyMember(agencyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      role: string;
    }) => {
      return apiClient<AddMemberResponse>(
        `/agencies/${agencyId}/users`,
        { method: "POST", body: JSON.stringify(payload) }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-team", agencyId] });
    },
  });
}

function useUpdateAgencyUserRole(agencyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiClient(`/agencies/${agencyId}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-team", agencyId] });
    },
  });
}

function useRemoveAgencyUser(agencyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return apiClient(`/agencies/${agencyId}/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-team", agencyId] });
    },
  });
}

// ─── Helpers ────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  return "??";
}

// ─── Confirm Dialog ─────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isPending && onCancel()}
      />
      <div className="relative w-full max-w-sm mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6">
        <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-9 px-4 flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Member Row ─────────────────────────────────────────────────

function MemberRow({
  member,
  agencyId,
  isSelf,
  canManage,
}: {
  member: AgencyMember;
  agencyId: string;
  isSelf: boolean;
  canManage: boolean;
}) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateRoleMutation = useUpdateAgencyUserRole(agencyId);
  const removeMutation = useRemoveAgencyUser(agencyId);

  const handleRoleToggle = useCallback(async () => {
    const newRole = member.agencyRole === "agency_admin" ? "agency_member" : "agency_admin";
    try {
      await updateRoleMutation.mutateAsync({ userId: member.id, role: newRole });
    } catch {
      // handled by mutation state
    }
    setMenuOpen(false);
  }, [member.agencyRole, member.id, updateRoleMutation]);

  const handleRemove = useCallback(async () => {
    try {
      await removeMutation.mutateAsync(member.id);
    } catch {
      // handled by mutation state
    }
    setConfirmDelete(false);
  }, [member.id, removeMutation]);

  const targetRoleLabel = member.agencyRole === "agency_admin"
    ? t("team.roles.agency_member")
    : t("team.roles.agency_admin");

  return (
    <>
      <div
        className={cn(
          "flex flex-col sm:grid sm:grid-cols-[1fr_1fr_140px_100px_60px] gap-2 sm:gap-4 px-5 py-4 sm:items-center transition-colors hover:bg-zinc-900/30",
          "border-b border-white/5 last:border-b-0 last:rounded-b-xl"
        )}
      >
        {/* Name + Avatar */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center text-xs font-medium text-zinc-300">
            {getInitials(member.firstName, member.lastName)}
          </div>
          <span className="text-sm font-medium text-zinc-100 truncate">
            {member.firstName} {member.lastName}
          </span>
        </div>

        {/* Email */}
        <span className="text-sm text-zinc-400 truncate pl-11 sm:pl-0">
          {member.email}
        </span>

        {/* Role badge */}
        <div className="pl-11 sm:pl-0">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
              member.agencyRole === "agency_admin"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-zinc-800 text-zinc-400 border-zinc-700/50"
            )}
          >
            {t(`team.roles.${member.agencyRole}` as "team.roles.agency_admin")}
          </span>
        </div>

        {/* Status */}
        <div className="pl-11 sm:pl-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              member.isActive ? "text-emerald-400" : "text-zinc-500"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                member.isActive ? "bg-emerald-400" : "bg-zinc-600"
              )}
            />
            {member.isActive ? t("team.status.active") : t("team.status.inactive")}
          </span>
        </div>

        {/* Actions */}
        <div className="pl-11 sm:pl-0 relative">
          {canManage && !isSelf ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-9 z-50 w-48 rounded-lg border border-white/10 bg-zinc-950 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={handleRoleToggle}
                      disabled={updateRoleMutation.isPending}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/80 transition-colors disabled:opacity-50"
                    >
                      <Shield className="w-3.5 h-3.5 text-zinc-500" />
                      {targetRoleLabel} {t("team.actions.makeRole")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t("team.actions.remove")}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("team.confirmRemove.title")}
        description={t("team.confirmRemove.description", { name: `${member.firstName} ${member.lastName}` })}
        confirmLabel={t("team.confirmRemove.confirm")}
        cancelLabel={t("team.form.cancel")}
        isPending={removeMutation.isPending}
        onConfirm={handleRemove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

// ─── Add Member Dialog ──────────────────────────────────────────

function AddMemberDialog({
  agencyId,
  open,
  onClose,
}: {
  agencyId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useAddAgencyMember(agencyId);

  const schema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t("team.validation.firstNameRequired")),
        lastName: z.string().min(1, t("team.validation.lastNameRequired")),
        email: z.string().email(t("team.validation.emailRequired")),
        password: z
          .string()
          .min(1, t("team.validation.passwordRequired"))
          .min(6, t("team.validation.passwordMin")),
        role: z.enum(["agency_admin", "agency_member"]),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "agency_member",
    },
  });

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    setSubmitError(null);
    reset();
    onClose();
  }, [mutation.isPending, reset, onClose]);

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(data);
      reset();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("team.submitError")
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {t("team.addMemberTitle")}
              </h2>
              <p className="text-xs text-zinc-500">
                {t("team.addMemberDescription")}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {submitError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  {t("team.form.firstName")}
                </label>
                <input
                  {...register("firstName")}
                  disabled={mutation.isPending}
                  className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  {t("team.form.lastName")}
                </label>
                <input
                  {...register("lastName")}
                  disabled={mutation.isPending}
                  className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {t("team.form.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                disabled={mutation.isPending}
                className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {t("team.form.password")}
              </label>
              <input
                {...register("password")}
                type="password"
                disabled={mutation.isPending}
                className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {t("team.form.role")}
              </label>
              <select
                {...register("role")}
                disabled={mutation.isPending}
                className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
              >
                <option value="agency_member">
                  {t("team.form.roleMember")}
                </option>
                <option value="agency_admin">
                  {t("team.form.roleAdmin")}
                </option>
              </select>
              <p className="mt-1.5 text-[11px] text-zinc-600">
                {t("team.form.clientHint")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="h-9 px-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {t("team.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !isValid}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {mutation.isPending
                ? t("team.form.submitting")
                : t("team.form.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function TeamPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const canManage = canManageCompanies(user?.role, user?.agencyRole ?? undefined);
  const agencyId = user?.agencyId ?? null;

  const { data: agency, isLoading, isError } = useAgencyTeam(agencyId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // If not admin, show restricted
  if (!canManage) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center">
          <h2 className="text-lg font-medium text-zinc-100">
            {t("common.accessRestrictedTitle")}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {t("team.restrictedDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            {t("team.pageTitle")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {t("team.pageSubtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t("team.addMember")}
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-500">{t("team.loadingDescription")}</p>
        </div>
      ) : null}

      {/* Error */}
      {!isLoading && isError ? (
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center">
          <h2 className="text-lg font-medium text-zinc-100 mb-2">
            {t("team.errorTitle")}
          </h2>
          <p className="text-sm text-zinc-500">{t("team.errorDescription")}</p>
        </div>
      ) : null}

      {/* Empty */}
      {!isLoading && !isError && agency && agency.users.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-12 text-center flex flex-col items-center">
          <div className="h-10 w-10 rounded-lg bg-zinc-800/80 border border-white/5 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-zinc-100">
            {t("team.emptyState")}
          </h2>
          <p className="mx-auto max-w-md text-sm text-zinc-500 mb-6">
            {t("team.emptyDescription")}
          </p>
          <button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("team.addMember")}
          </button>
        </div>
      ) : null}

      {/* Members list */}
      {!isLoading && !isError && agency && agency.users.length > 0 ? (
        <div className="rounded-xl border border-white/5 bg-zinc-950">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_140px_100px_60px] gap-4 px-5 py-3 border-b border-white/5 text-xs font-medium text-zinc-500 uppercase tracking-wider rounded-t-xl">
            <span>{t("team.table.name")}</span>
            <span>{t("team.table.email")}</span>
            <span>{t("team.table.role")}</span>
            <span>{t("team.table.status")}</span>
            <span />
          </div>

          {/* Rows */}
          {agency.users.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              agencyId={agency.id}
              isSelf={member.id === user?.id}
              canManage={canManage}
            />
          ))}
        </div>
      ) : null}

      {/* Add member dialog */}
      {agencyId ? (
        <AddMemberDialog
          agencyId={agencyId}
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
