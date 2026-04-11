"use client";

import { TokenPasswordForm } from "@/components/shared/token-password-form";

export default function AcceptInvitePage() {
  return (
    <TokenPasswordForm
      keyPrefix="auth.acceptInvite"
      endpoint="/auth/accept-invite"
    />
  );
}
