import { PageContainer } from "@/components/shared/page-container";
import { cn } from "@/lib/utils";

interface PageStatePanelProps {
  title: string;
  description: string;
  className?: string;
}

export function PageStatePanel({
  title,
  description,
  className,
}: PageStatePanelProps) {
  return (
    <PageContainer className={cn("animate-in fade-in duration-500 pb-12", className)}>
      <div className="rounded-xl border border-white/5 bg-zinc-950/50 p-12 text-center">
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">{title}</h1>
        <p className="mx-auto max-w-md text-sm text-zinc-500">{description}</p>
      </div>
    </PageContainer>
  );
}
