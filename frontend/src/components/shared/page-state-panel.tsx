import { PageContainer } from "@/components/shared/page-container";
import { cn } from "@/lib/utils";

interface PageStatePanelProps {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageStatePanel({
  title,
  description,
  className,
  children,
}: PageStatePanelProps) {
  return (
    <PageContainer className={cn("animate-in fade-in duration-500 pb-12", className)}>
      <div className="rounded-xl border border-white/5 bg-zinc-950/50 p-12 text-center flex flex-col items-center">
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">{title}</h1>
        <p className="mx-auto max-w-md text-sm text-zinc-500 mb-6">{description}</p>
        {children}
      </div>
    </PageContainer>
  );
}
