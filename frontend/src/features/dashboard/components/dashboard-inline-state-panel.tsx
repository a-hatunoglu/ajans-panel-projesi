"use client";

interface DashboardInlineStatePanelProps {
  message: string;
}

export function DashboardInlineStatePanel({
  message,
}: DashboardInlineStatePanelProps) {
  return (
    <div className="p-6 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
