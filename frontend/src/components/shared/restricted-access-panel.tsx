"use client";

import { cn } from "@/lib/utils";
import { useUiCopy } from "@/lib/copy";

interface RestrictedAccessPanelProps {
  description: string;
  title?: string;
  className?: string;
}

export function RestrictedAccessPanel({
  description,
  title,
  className,
}: RestrictedAccessPanelProps) {
  const uiCopy = useUiCopy();

  return (
    <div className={cn("rounded-xl border border-white/5 bg-zinc-950 py-24 text-center", className)}>
      <h2 className="mb-2 font-medium text-zinc-300">{title || uiCopy.accessRestrictedTitle}</h2>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  );
}
