"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { ContentMediaItem } from "../types";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface ContentMediaUploadProps {
  contentId: string;
  media: ContentMediaItem[];
  canManage: boolean;
}

export function ContentMediaUpload({ contentId, media, canManage }: ContentMediaUploadProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleUpload = async (file: File) => {
    if (!canManage) return;
    setIsUploading(true);

    try {
      // 1. Get Presigned URL
      const presignedRes = await apiClient<{ data: { uploadUrl: string; finalUrl: string } }>(`/contents/${contentId}/media/presigned-url`, {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          mimetype: file.type,
        }),
      });

      const { uploadUrl, finalUrl } = presignedRes.data;

      // 2. Upload to S3 directly
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Direct S3 upload failed");
      }

      // 3. Confirm Media Upload with backend
      await apiClient(`/contents/${contentId}/media/confirm`, {
        method: "POST",
        body: JSON.stringify({
          url: finalUrl,
          fileType: file.type,
          sizeBytes: file.size,
        }),
      });

      await queryClient.invalidateQueries({ queryKey: ["content-detail", contentId] });
    } catch {
      alert(t("contentDetail.media.uploadError", { defaultValue: "Dosya yüklenirken hata oluştu." }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!canManage) return;
    if (!confirm(t("contentDetail.media.deleteConfirm", { defaultValue: "Medyayı silmek istediğinize emin misiniz?" }))) return;

    try {
      await apiClient(`/contents/${contentId}/media/${mediaId}`, {
        method: "DELETE",
      });
      await queryClient.invalidateQueries({ queryKey: ["content-detail", contentId] });
    } catch {
      alert(t("contentDetail.media.deleteError", { defaultValue: "Silme işlemi başarısız oldu." }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!canManage) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const renderMediaItem = (item: ContentMediaItem) => {
    const isVideo = item.fileType.startsWith("video/");
    const isImage = item.fileType.startsWith("image/");

    return (
      <div key={item.id} className="relative group overflow-hidden rounded-xl border border-white/10 bg-zinc-900 bg-cover bg-center">
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="Content media" className="w-full h-auto aspect-video object-cover" />
        )}
        {isVideo && (
          <video src={item.url} controls className="w-full h-auto aspect-video object-cover" />
        )}
        {!isImage && !isVideo && (
          <div className="flex w-full aspect-video items-center justify-center bg-zinc-900">
            <span className="text-xs text-zinc-500 font-mono">.{item.fileType.split("/")[1] || "file"}</span>
          </div>
        )}
        
        {canManage && (
          <button
            onClick={() => handleDelete(item.id)}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {media.map(renderMediaItem)}

      {media.length === 0 && !canManage && (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-zinc-900/30 sm:aspect-[4/3]">
          <div className="flex flex-col items-center gap-2 text-zinc-600">
            <ImageIcon className="h-8 w-8 opacity-50" />
            <span className="text-xs font-medium">{t("contentDetail.body.assetPreviewUnavailable")}</span>
          </div>
        </div>
      )}

      {canManage && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex aspect-video sm:aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
            dragActive ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-zinc-950 hover:bg-zinc-900/50 hover:border-white/20"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">Yükleniyor...</span>
            </>
          ) : (
            <>
              <div className="h-10 w-10 flex text-zinc-500 items-center justify-center rounded-lg bg-zinc-900 border border-white/5">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-zinc-300 block">Dosya yüklemek için tıklayın</span>
                <span className="text-xs text-zinc-600">veya sürükleyip bırakın (Max 50MB)</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
