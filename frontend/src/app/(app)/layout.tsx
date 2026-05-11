import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import { CommandPalette } from "@/components/shared/command-palette";
import { KeyboardShortcuts } from "@/components/shared/keyboard-shortcuts";

export const dynamic = "force-dynamic";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <CommandPalette />
        <KeyboardShortcuts />
        {/* Dynamic Route Body */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </main>
      </div>
    </div>
  );
}
