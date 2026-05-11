"use client";

import { useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, UserPlus, Check } from "lucide-react";
import { useAddAgencyUserMutation } from "@/features/platform/api/mutations";

interface AddAgencyUserDialogProps {
  open: boolean;
  agencyId: string;
  agencyName: string;
  onClose: () => void;
}

export function AddAgencyUserDialog({
  open,
  agencyId,
  agencyName,
  onClose,
}: AddAgencyUserDialogProps) {
  const schema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, "Ad zorunludur.").max(100),
        lastName: z.string().min(1, "Soyad zorunludur.").max(100),
        email: z.string().email("Geçerli bir e-posta giriniz."),
        password: z
          .string()
          .min(6, "Şifre en az 6 karakter olmalıdır.")
          .max(128),
        role: z.enum(["agency_admin", "agency_member"]),
      }),
    []
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "agency_member",
    },
  });

  const addMutation = useAddAgencyUserMutation(agencyId);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPending = addMutation.isPending;

  const handleClose = useCallback(() => {
    if (isPending) return;
    setSubmitError(null);
    setShowSuccess(false);
    reset();
    onClose();
  }, [isPending, reset, onClose]);

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      await addMutation.mutateAsync(data);
      setShowSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kullanıcı eklenemedi."
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {showSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 border border-green-500/20">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              Kullanıcı Eklendi
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Kullanıcı <strong>{agencyName}</strong> ajansına başarıyla
              eklendi.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-10 flex items-center justify-center rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Tamam
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-100">
                    Kullanıcı Ekle
                  </h2>
                  <p className="text-xs text-zinc-500">{agencyName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 font-medium">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Ad *
                    </label>
                    <input
                      {...register("firstName")}
                      disabled={isPending}
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Soyad *
                    </label>
                    <input
                      {...register("lastName")}
                      disabled={isPending}
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    E-posta *
                  </label>
                  <input
                    {...register("email")}
                    disabled={isPending}
                    type="email"
                    placeholder="kullanici@ajans.com"
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Geçici Şifre *
                  </label>
                  <input
                    {...register("password")}
                    disabled={isPending}
                    type="text"
                    placeholder="En az 6 karakter"
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Ajans Rolü *
                  </label>
                  <select
                    {...register("role")}
                    disabled={isPending}
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  >
                    <option value="agency_admin">Admin</option>
                    <option value="agency_member">Üye</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="h-9 px-4 rounded-md text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !isValid}
                  className="h-9 px-4 flex items-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Ekle
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
