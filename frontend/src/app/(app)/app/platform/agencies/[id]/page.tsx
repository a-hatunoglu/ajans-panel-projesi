"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Users,
  FolderOpen,
  FileText,
  ExternalLink,
  Loader2,
  Trash2,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  UserPlus,
} from "lucide-react";
import { useAgencyDetail } from "@/features/platform/api/queries";
import {
  useUpdateAgencyMutation,
  useDeleteAgencyMutation,
  useRestoreAgencyMutation,
} from "@/features/platform/api/mutations";
import { useState } from "react";
import { AddAgencyUserDialog } from "@/features/platform/components/add-agency-user-dialog";

export default function AgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;
  const { data: agency, isLoading } = useAgencyDetail(agencyId);
  const updateMutation = useUpdateAgencyMutation(agencyId);
  const deleteMutation = useDeleteAgencyMutation();
  const restoreMutation = useRestoreAgencyMutation();
  const [enteringPanel, setEnteringPanel] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-zinc-500">Ajans bulunamadı.</p>
        <button
          onClick={() => router.push("/app/platform/agencies")}
          className="mt-3 text-xs text-blue-400 hover:text-blue-300"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const isDeleted = !!agency.deletedAt;

  const handleToggleActive = async () => {
    await updateMutation.mutateAsync({ isActive: !agency.isActive });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(agencyId);
    router.push("/app/platform/agencies");
  };

  const handleRestore = async () => {
    await restoreMutation.mutateAsync(agencyId);
  };

  const handleEnterPanel = () => {
    setEnteringPanel(true);
    // Set active agency context and redirect to agency panel
    if (typeof window !== "undefined") {
      localStorage.setItem("agencyos-active-agency-id", agencyId);
      localStorage.setItem("agencyos-active-agency-name", agency.name);
    }
    // Redirect to the normal app dashboard — agency scope will apply via header
    window.location.href = "/app";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/app/platform/agencies")}
            className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">
                {agency.name}
              </h1>
              <p className="text-xs text-zinc-500">/{agency.slug}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isDeleted && (
            <button
              onClick={handleEnterPanel}
              disabled={enteringPanel || !agency.isActive}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enteringPanel ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
              Panele Gir
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isDeleted && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between">
          <p className="text-sm text-red-400">
            Bu ajans silinmiş durumda. Geri getirmek ister misiniz?
          </p>
          <button
            onClick={handleRestore}
            disabled={restoreMutation.isPending}
            className="h-8 px-3 flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Geri Getir
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/5 bg-zinc-900/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500">Şirketler</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-100 tabular-nums">
            {agency.stats.companyCount}
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-zinc-900/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">Kullanıcılar</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-100 tabular-nums">
            {agency.stats.userCount}
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-zinc-900/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500">İçerikler</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-100 tabular-nums">
            {agency.stats.contentCount}
          </p>
        </div>
      </div>

      {/* Agency Info */}
      <div className="rounded-lg border border-white/5 bg-zinc-900/20 p-5 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Ajans Bilgileri</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="E-posta" value={agency.email} />
          <InfoRow label="Telefon" value={agency.phone} />
          <InfoRow label="Website" value={agency.website} />
          <InfoRow
            label="Oluşturulma"
            value={new Date(agency.createdAt).toLocaleDateString("tr-TR")}
          />
        </div>
      </div>

      {/* Users */}
      <div className="rounded-lg border border-white/5 bg-zinc-900/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">
            Ajans Kullanıcıları
          </h2>
          {!isDeleted && (
            <button
              onClick={() => setShowAddUser(true)}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-white/5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Kullanıcı Ekle
            </button>
          )}
        </div>
        {agency.users.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            Henüz kullanıcı yok
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/30">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Kullanıcı
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  E-posta
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Rol
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {agency.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-5 py-3 text-zinc-200">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-3 text-zinc-400">{user.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        user.agencyRole === "agency_admin"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-white/5"
                      }`}
                    >
                      {user.agencyRole === "agency_admin"
                        ? "Admin"
                        : "Üye"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-500 border border-white/5"
                      }`}
                    >
                      {user.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Actions */}
      {!isDeleted && (
        <div className="rounded-lg border border-white/5 bg-zinc-900/20 p-5 space-y-4">
          <h2 className="text-sm font-medium text-zinc-300">İşlemler</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleToggleActive}
              disabled={updateMutation.isPending}
              className="h-8 px-3 flex items-center gap-2 rounded-md border border-white/5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {agency.isActive ? (
                <>
                  <ToggleLeft className="w-3.5 h-3.5" /> Deaktive Et
                </>
              ) : (
                <>
                  <ToggleRight className="w-3.5 h-3.5" /> Aktive Et
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-8 px-3 flex items-center gap-2 rounded-md border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Ajansı Sil
            </button>
          </div>
        </div>
      )}

      {agency && (
        <AddAgencyUserDialog
          open={showAddUser}
          agencyId={agencyId}
          agencyName={agency.name}
          onClose={() => setShowAddUser(false)}
        />
      )}
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-zinc-300">{value || "—"}</p>
    </div>
  );
}
