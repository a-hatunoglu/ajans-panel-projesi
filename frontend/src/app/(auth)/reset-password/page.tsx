"use client";

import { TokenPasswordForm } from "@/components/shared/token-password-form";

export default function ResetPasswordPage() {
  return (
    <TokenPasswordForm
      keyPrefix="auth.resetPassword"
      endpoint="/auth/reset-password"
    />
  );
}
