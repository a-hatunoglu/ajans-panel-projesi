"use client";

import { useI18n } from "@/i18n/provider";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInviteSystemUserMutation,
  useUpdateSystemUserMutation,
} from "@/features/settings/api/mutations";
import { Loader2, X } from "lucide-react";
import type { SystemUserItem } from "@/features/settings/api/queries";
import { useAuth } from "@/providers/auth-provider";

import { isPlatformOwner } from "@/lib/roles";

const VALID_ROLES = ["platform_owner", "user"] as const;

export function SystemUserDialog({
  open,
  onOpenChange,
  user,
  isInvite,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  user?: SystemUserItem | null;
  isInvite?: boolean;
}) {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const actorRole = currentUser?.role || "user";

  // Filter role options: Only platform owner can assign platform_owner role
  const availableRoles = isPlatformOwner(actorRole)
    ? VALID_ROLES
    : VALID_ROLES.filter((r) => r !== "platform_owner");

  const inviteMutation = useInviteSystemUserMutation();
  const updateMutation = useUpdateSystemUserMutation();
  const isLoading = inviteMutation.isPending || updateMutation.isPending;

  const schema = useMemo(() => {
    return z.object({
      firstName: z.string().min(1, t("settings.users.validation.reqFirst")),
      lastName: z.string().min(1, t("settings.users.validation.reqLast")),
      email: z.string().email().optional().or(z.literal("")),
      role: z.enum(VALID_ROLES),
      isActive: z.boolean().default(true),
      provisionType: z.enum(["email", "password"]).optional(),
      tempPassword: z.string().optional(),
    }).superRefine((data, ctx) => {
      if (isInvite) {
        if (data.provisionType === "email" && !data.email) {
          ctx.addIssue({
            code: "custom",
            path: ["email"],
            message: "Email is required",
          });
        }
        if (data.provisionType === "password") {
          if (!data.tempPassword || data.tempPassword.length < 6) {
            ctx.addIssue({
              code: "custom",
              path: ["tempPassword"],
              message: "Temporary password must be at least 6 characters",
            });
          }
          if (!data.email) {
            ctx.addIssue({
              code: "custom",
              path: ["email"],
              message: "Email is required",
            });
          }
        }
      }
    });
  }, [t, isInvite]);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      isActive: true,
      provisionType: "email",
      tempPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (user && !isInvite) {
        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as FormValues["role"],
          isActive: user.isActive,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          role: "user",
          isActive: true,
          provisionType: "email",
          tempPassword: "",
        });
      }
    }
  }, [open, user, isInvite, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isInvite) {
        await inviteMutation.mutateAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email!,
          role: data.role,
          tempPassword: data.provisionType === "password" ? data.tempPassword : undefined,
        });
      } else if (user) {
        await updateMutation.mutateAsync({
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          isActive: data.isActive,
        });
      }
      onOpenChange(false);
    } catch {
      // Error is surfaced by mutation.isError state
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-[425px] rounded-lg border border-white/10 bg-zinc-950 shadow-lg flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">
            {isInvite 
              ? t("settings.users.inviteTitle") 
              : t("settings.users.editTitle")}
          </h2>
          <button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {isInvite && (
             <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                    <input 
                      type="radio" 
                      value="email" 
                      {...register("provisionType")} 
                      className="accent-white" 
                    />
                    {t("settings.users.provisionEmail")}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                    <input 
                      type="radio" 
                      value="password" 
                      {...register("provisionType")} 
                      className="accent-white" 
                    />
                    {t("settings.users.provisionPassword")}
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    {t("settings.users.email")} {watch("provisionType") === "password" ? "(Linked Email)" : ""}
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

               {watch("provisionType") === "password" && (
                 <div className="animate-in fade-in duration-200">
                   <label className="text-sm font-medium text-zinc-300 block mb-1">
                     {t("settings.users.tempPassword")}
                   </label>
                   <input
                     type="text"
                     {...register("tempPassword")}
                     className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                   />
                   {errors.tempPassword && <p className="text-xs text-red-500 mt-1">{errors.tempPassword.message}</p>}
                   <p className="text-xs text-zinc-500 mt-1">
                     {t("settings.users.tempPasswordDesc")}
                   </p>
                 </div>
               )}
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-sm font-medium text-zinc-300 block mb-1">
                 {t("settings.users.firstName")}
               </label>
               <input
                 type="text"
                 {...register("firstName")}
                 className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
               />
               {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
               <label className="text-sm font-medium text-zinc-300 block mb-1">
                 {t("settings.users.lastName")}
               </label>
               <input
                 type="text"
                 {...register("lastName")}
                 className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
               />
               {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
             <label className="text-sm font-medium text-zinc-300 block mb-1">
               {t("settings.users.globalRole")}
             </label>
             <select
               {...register("role")}
               className="w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
             >
               {availableRoles.map((role) => (
                 <option key={role} value={role}>
                   {role === "platform_owner" ? "Platform Owner" : "User"}
                 </option>
               ))}
             </select>
          </div>

          {!isInvite && (
            <div>
               <label className="text-sm font-medium text-zinc-300 block mb-1">
                 {t("settings.users.status")}
               </label>
               <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="h-4 w-4 rounded border-white/10 bg-zinc-900/50 accent-white"
                  />
                  <label htmlFor="isActive" className="text-sm text-zinc-200 cursor-pointer">
                    {t("settings.users.activeToggle")}
                  </label>
               </div>
            </div>
          )}

          {inviteMutation.isError && (
             <p className="text-sm text-red-500 font-medium">
                {inviteMutation.error instanceof Error ? inviteMutation.error.message : "Error"}
             </p>
          )}

          {updateMutation.isError && (
             <p className="text-sm text-red-500 font-medium">
                {updateMutation.error instanceof Error ? updateMutation.error.message : "Error"}
             </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
