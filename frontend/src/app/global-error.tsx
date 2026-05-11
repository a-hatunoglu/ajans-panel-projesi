"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="tr" className="dark" style={{ colorScheme: "dark" }}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center flex flex-col gap-6 animate-in fade-in duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 mx-auto">
            <span className="text-lg">⚠</span>
          </div>
          <h1 className="text-xl font-medium text-zinc-100">
            Beklenmeyen bir hata oluştu
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Bir şeyler ters gitti. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center rounded-md border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
