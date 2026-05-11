"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/shared/page-container";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to error reporting service
  }, [error]);

  return (
    <PageContainer className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-900">
          <span className="text-base">⚠</span>
        </div>
        <h1 className="mb-2 text-xl font-medium text-zinc-100">
          Beklenmeyen bir hata oluştu
        </h1>
        <p className="mb-6 max-w-md text-sm text-zinc-400 leading-relaxed">
          Bu sayfa yüklenirken bir hata meydana geldi. Lütfen tekrar deneyin.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-md border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Tekrar Dene
        </button>
      </div>
    </PageContainer>
  );
}
