 "use client";

import { ContentDetailData } from "../types";
import { useI18n } from "@/i18n/provider";
import { ContentMediaUpload } from "./content-media-upload";

export function ContentBody({ data }: { data: ContentDetailData }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <ContentMediaUpload contentId={data.id} media={data.media} />

      <div className="rounded-xl border border-white/5 bg-zinc-950 p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">{t("contentDetail.body.title")}</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {data.body || t("contentDetail.body.emptyBody")}
        </p>
      </div>
    </div>
  );
}
