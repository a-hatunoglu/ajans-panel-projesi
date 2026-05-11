"use client";

import { useAuth } from "@/providers/auth-provider";
import { useCompanyUsers } from "@/features/company-detail/api/queries";

export function useCompanyRoles(companyId?: string) {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { data: usersData, isLoading: isUsersLoading } = useCompanyUsers(companyId);

  if (!user) {
    return {
      globalRole: "guest",
      companyRoles: [],
      hasRole: () => false,
      isOwnerOrAdmin: false,
      isLoading: isAuthLoading,
    };
  }

  const isOwnerOrAdmin = user.role === "owner" || user.role === "admin";
  const membership = usersData?.members.find((m) => m.userId === user.id);
  const companyRoles = membership?.roles || [];

  /**
   * Check if user effectively has the required role.
   * Being a global owner/admin implicitly grants powers in many places, 
   * but this just answers if they possess the role directly or via global authority.
   */
  function hasRole(roleToCheck: string) {
    if (isOwnerOrAdmin) return true;
    if (user!.role === roleToCheck) return true;
    return companyRoles.includes(roleToCheck);
  }

  return {
    globalRole: user.role,
    companyRoles,
    hasRole,
    isOwnerOrAdmin,
    isLoading: isAuthLoading || (!!companyId && isUsersLoading),
  };
}
