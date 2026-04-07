"use client";

interface DashboardInlineStatePanelProps {
  message: string;
}

export function DashboardInlineStatePanel({
  message,
}: DashboardInlineStatePanelProps) {
  return (
    <div className="rounded-lg border border-dashed border-white/5 bg-zinc-900/10 p-4 text-sm text-zinc-500">
      {message}
    </div>
  );
}
