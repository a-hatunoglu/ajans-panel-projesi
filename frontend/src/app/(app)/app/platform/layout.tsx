"use client";

import { useAuth } from "@/providers/auth-provider";
import { isPlatformOwner } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isPlatformOwner(user.role))) {
      router.replace("/app");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !isPlatformOwner(user.role)) {
    return null;
  }

  return <>{children}</>;
}
