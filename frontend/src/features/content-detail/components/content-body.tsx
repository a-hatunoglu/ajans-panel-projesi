 "use client";

import { ContentDetailData } from "../types";
import { Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function ContentBody({ data }: { data: ContentDetailData }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-zinc-900/30 sm:aspect-[4/3]">
        <div className="flex flex-col items-center gap-2 text-zinc-600">
          <ImageIcon className="h-8 w-8 opacity-50" />
          <span className="text-xs font-medium">{t("contentDetail.body.assetPreviewUnavailable")}</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-zinc-950 p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">{t("contentDetail.body.title")}</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {data.body || t("contentDetail.body.emptyBody")}
        </p>
      </div>
    </div>
  );
}
