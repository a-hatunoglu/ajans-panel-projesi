"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  FolderOpen,
  Users,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { useAgencies } from "@/features/platform/api/queries";
import {
  useDeleteAgencyMutation,
  useRestoreAgencyMutation,
} from "@/features/platform/api/mutations";
import { CreateAgencyDialog } from "@/features/platform/components/create-agency-dialog";
import type { AgencyListItem } from "@/features/platform/api/queries";

type StatusFilter = "active" | "inactive" | "deleted" | "all";

export default function AgenciesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const { data, isLoading } = useAgencies({ search, status });
  const deleteMutation = useDeleteAgencyMutation();
  const restoreMutation = useRestoreAgencyMutation();

  const agencies = data?.agencies ?? [];

  const handleDelete = async (id: string) => {
    setMenuOpenId(null);
    await deleteMutation.mutateAsync(id);
  };

  const handleRestore = async (id: string) => {
    setMenuOpenId(null);
    await restoreMutation.mutateAsync(id);
  };

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Pasif" },
    { value: "deleted", label: "Silinmiş" },
    { value: "all", label: "Tümü" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/app/platform")}
            className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Ajanslar</h1>
            <p className="text-xs text-zinc-500">
              {data?.meta?.total ?? 0} ajans
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Ajans
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ajans ara..."
            className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        <div className="flex rounded-md border border-white/5 overflow-hidden">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                status === tab.value
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-white/5 bg-zinc-900/50 animate-pulse"
            />
          ))}
        </div>
      ) : agencies.length === 0 ? (
        <div className="rounded-lg border border-white/5 bg-zinc-900/30 p-10 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-400">
            {search
              ? "Aramanızla eşleşen ajans bulunamadı."
              : "Bu kategoride ajans yok."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Ajans
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Şirketler
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Kullanıcılar
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Durum
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <AgencyRow
                  key={agency.id}
                  agency={agency}
                  isMenuOpen={menuOpenId === agency.id}
                  onToggleMenu={() =>
                    setMenuOpenId(menuOpenId === agency.id ? null : agency.id)
                  }
                  onCloseMenu={() => setMenuOpenId(null)}
                  onView={() =>
                    router.push(`/app/platform/agencies/${agency.id}`)
                  }
                  onDelete={() => handleDelete(agency.id)}
                  onRestore={() => handleRestore(agency.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateAgencyDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}

// ─── Agency Row ──────────────────────────────────────────────

function AgencyRow({
  agency,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onView,
  onDelete,
  onRestore,
}: {
  agency: AgencyListItem;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onView: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const isDeleted = !!agency.deletedAt;

  return (
    <tr
      className="border-b border-white/5 hover:bg-zinc-900/30 transition-colors cursor-pointer"
      onClick={onView}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <p
              className={`font-medium ${isDeleted ? "text-zinc-500 line-through" : "text-zinc-200"}`}
            >
              {agency.name}
            </p>
            <p className="text-xs text-zinc-600">/{agency.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <FolderOpen className="w-3.5 h-3.5 text-zinc-600" />
          {agency.companyCount}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Users className="w-3.5 h-3.5 text-zinc-600" />
          {agency.userCount}
        </span>
      </td>
      <td className="px-4 py-3">
        {isDeleted ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
            Silinmiş
          </span>
        ) : agency.isActive ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Aktif
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-white/5 font-medium">
            Pasif
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseMenu();
                }}
              />
              <div className="absolute right-0 top-8 z-50 w-40 rounded-md border border-white/10 bg-zinc-950 shadow-xl py-1">
                {isDeleted ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore();
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Geri Getir
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-red-400 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Sil
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
