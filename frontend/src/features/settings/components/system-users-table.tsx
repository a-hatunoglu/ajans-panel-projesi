"use client";

import { useSystemUsers, type SystemUserItem } from "@/features/settings/api/queries";
import { useI18n } from "@/i18n/provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Loader2, MoreHorizontal, MailPlus, Edit2, Link as LinkIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { SystemUserDialog } from "./system-user-dialog";
import { AttachCompanyDialog } from "./attach-company-dialog";

export function SystemUsersTable() {
  const { t } = useI18n();
  const page = 1;
  const { data, isLoading } = useSystemUsers(page, 20);

  const [editUser, setEditUser] = useState<SystemUserItem | null>(null);
  const [attachUser, setAttachUser] = useState<SystemUserItem | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  const users = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-lg font-medium text-white">{t("settings.users.listTitle")}</h2>
        <button 
          onClick={() => setIsInviteOpen(true)} 
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          <MailPlus className="w-4 h-4" />
          {t("settings.users.invite")}
        </button>
      </div>

      <div className="overflow-x-auto pb-24" ref={dropdownRef}>
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">{t("settings.users.columns.user")}</th>
              <th className="px-6 py-4 font-medium">{t("settings.users.columns.globalRole")}</th>
              <th className="px-6 py-4 font-medium">{t("settings.users.columns.status")}</th>
              <th className="px-6 py-4 font-medium">{t("settings.users.columns.joinedAt")}</th>
              <th className="px-6 py-4 font-medium text-right">{t("settings.users.columns.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 relative">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  {t("settings.users.noUsers")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        avatarUrl={user.avatarUrl}
                        className="h-8 w-8"
                      />
                      <div>
                        <div className="font-medium text-zinc-200">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-300 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                      <span className={user.isActive ? "text-zinc-300" : "text-zinc-500"}>
                        {user.isActive ? t("common.active") : t("common.inactive")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {format(new Date(user.createdAt), "dd MMM yyyy", { locale: tr })}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {openDropdownId === user.id && (
                      <div className="absolute right-6 top-10 z-50 min-w-[160px] overflow-hidden rounded-md border border-white/10 bg-zinc-950 p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 text-left">
                          {t("common.actions")}
                        </div>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setOpenDropdownId(null);
                          }}
                          className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-zinc-300 outline-none hover:bg-zinc-800 hover:text-white gap-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={() => {
                            setAttachUser(user);
                            setOpenDropdownId(null);
                          }}
                          className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-zinc-300 outline-none hover:bg-zinc-800 hover:text-white gap-2 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          {t("settings.users.attachCompany")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SystemUserDialog 
        open={isInviteOpen || !!editUser} 
        onOpenChange={(val) => {
          if (!val) {
             setIsInviteOpen(false);
             setEditUser(null);
          }
        }}
        user={editUser}
        isInvite={isInviteOpen}
      />
      
      {attachUser && (
        <AttachCompanyDialog 
          open={!!attachUser}
          onOpenChange={(val) => !val && setAttachUser(null)}
          user={attachUser}
        />
      )}
    </div>
  );
}
