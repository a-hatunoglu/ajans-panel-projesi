import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/provider";
import { getMessages } from "@/i18n/messages";
import { resolveServerLocale } from "@/i18n/server";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const locale = resolveServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = resolveServerLocale();

  return (
    <html lang={locale} className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-50 antialiased selection:bg-zinc-800 selection:text-white`}>
        <QueryProvider>
          <I18nProvider initialLocale={locale}>
            <AuthProvider>
              {children}
              <Toaster theme="dark" position="bottom-right" />
            </AuthProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
