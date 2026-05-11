import { cn } from "@/lib/utils";

type ContentStatus = "draft" | "in_review" | "revise" | "approved" | "scheduled" | "published";

interface ContentStatusBadgeProps {
  status: ContentStatus;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function ContentStatusBadge({
  status,
  label,
  size = "sm",
  className,
}: ContentStatusBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const statusClasses = {
    draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    in_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    revise: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    published: "bg-zinc-800 text-zinc-500 border-zinc-700/50",
  };

  return (
    <span
      className={cn(
        "font-medium rounded-full border",
        sizeClasses[size],
        statusClasses[status],
        className
      )}
    >
      {label}
    </span>
  );
}
