"use client";

import { useAgencies } from "@/features/platform/api/queries";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  FolderOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { CreateAgencyDialog } from "@/features/platform/components/create-agency-dialog";

export default function PlatformDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading } = useAgencies();
  const [showCreate, setShowCreate] = useState(false);

  const agencies = data?.agencies ?? [];
  const activeCount = agencies.filter((a) => a.isActive && !a.deletedAt).length;
  const totalCompanies = agencies.reduce((sum, a) => sum + a.companyCount, 0);
  const totalUsers = agencies.reduce((sum, a) => sum + a.userCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Platform Yönetimi
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Hoş geldin, {user?.firstName}. Tüm ajansları buradan yönetebilirsin.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Ajans
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Building2 className="w-4 h-4" />}
          label="Aktif Ajanslar"
          value={isLoading ? "—" : String(activeCount)}
          accent="blue"
        />
        <StatCard
          icon={<FolderOpen className="w-4 h-4" />}
          label="Toplam Şirketler"
          value={isLoading ? "—" : String(totalCompanies)}
          accent="emerald"
        />
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Toplam Kullanıcılar"
          value={isLoading ? "—" : String(totalUsers)}
          accent="violet"
        />
      </div>

      {/* Agency List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-300">Ajanslar</h2>
          <button
            onClick={() => router.push("/app/platform/agencies")}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            Tümünü Gör <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 rounded-lg border border-white/5 bg-zinc-900/50 animate-pulse"
              />
            ))}
          </div>
        ) : agencies.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-zinc-900/30 p-10 text-center">
            <div className="mx-auto h-10 w-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-400 mb-1">Henüz ajans yok</p>
            <p className="text-xs text-zinc-600 mb-4">
              İlk ajansınızı oluşturarak başlayın
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="h-8 px-3 rounded-md bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors border border-white/5"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1.5" />
              Ajans Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agencies.slice(0, 6).map((agency) => (
              <button
                key={agency.id}
                onClick={() =>
                  router.push(`/app/platform/agencies/${agency.id}`)
                }
                className="group text-left rounded-lg border border-white/5 bg-zinc-900/30 p-4 hover:bg-zinc-900/60 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {agency.name}
                      </p>
                      <p className="text-xs text-zinc-600">/{agency.slug}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      agency.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-800 text-zinc-500 border border-white/5"
                    }`}
                  >
                    {agency.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {agency.companyCount} şirket
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {agency.userCount} kullanıcı
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/app/platform/agencies")}
          className="group text-left rounded-lg border border-white/5 bg-zinc-900/20 p-4 hover:bg-zinc-900/40 hover:border-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Ajans Yönetimi
              </p>
              <p className="text-xs text-zinc-600">
                Tüm ajansları listele, düzenle ve yönet
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => router.push("/app/system-health")}
          className="group text-left rounded-lg border border-white/5 bg-zinc-900/20 p-4 hover:bg-zinc-900/40 hover:border-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Sistem Sağlığı
              </p>
              <p className="text-xs text-zinc-600">
                API, veritabanı ve servis durumunu kontrol et
              </p>
            </div>
          </div>
        </button>
      </div>

      <CreateAgencyDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}

// ─── Stat Card Component ─────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "blue" | "emerald" | "violet";
}) {
  const accentStyles = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  };

  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`h-6 w-6 rounded flex items-center justify-center border ${accentStyles[accent]}`}
        >
          {icon}
        </div>
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-zinc-100 tabular-nums">
        {value}
      </p>
    </div>
  );
}
