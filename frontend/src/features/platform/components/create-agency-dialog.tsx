"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Building2, Check } from "lucide-react";
import { useCreateAgencyMutation } from "@/features/platform/api/mutations";

interface CreateAgencyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAgencyDialog({ open, onClose }: CreateAgencyDialogProps) {
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, "Ajans adı zorunludur.").max(200),
        slug: z
          .string()
          .min(1, "Slug zorunludur.")
          .max(200)
          .regex(
            /^[a-z0-9-]+$/,
            "Slug sadece küçük harf, rakam ve tire içerebilir."
          ),
        email: z.string().email("Geçerli bir e-posta giriniz.").optional().or(z.literal("")),
        phone: z.string().max(30).optional().or(z.literal("")),
        website: z.string().url("Geçerli bir URL giriniz.").optional().or(z.literal("")),
        adminFirstName: z.string().min(1, "Admin adı zorunludur.").max(100),
        adminLastName: z.string().min(1, "Admin soyadı zorunludur.").max(100),
        adminEmail: z.string().email("Geçerli bir e-posta giriniz."),
        adminPassword: z
          .string()
          .min(6, "Şifre en az 6 karakter olmalıdır.")
          .max(128),
      }),
    []
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      website: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  const createMutation = useCreateAgencyMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPending = createMutation.isPending;

  const handleClose = useCallback(() => {
    if (isPending) return;
    setSubmitError(null);
    setShowSuccess(false);
    reset();
    onClose();
  }, [isPending, reset, onClose]);

  // Auto-generate slug from name
  const nameValue = watch("name");
  const autoSlug = useCallback(
    (name: string) => {
      const slug = name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug, { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);

    try {
      await createMutation.mutateAsync({
        name: data.name,
        slug: data.slug,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        adminEmail: data.adminEmail,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminPassword: data.adminPassword,
      });
      setShowSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ajans oluşturulamadı.";
      setSubmitError(message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg mx-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 border border-green-500/20">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              Ajans Oluşturuldu
            </h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-[320px]">
              Yeni ajans ve admin hesabı başarıyla oluşturuldu. Admin
              kullanıcı artık giriş yapabilir.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
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
                  <Building2 className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-100">
                    Yeni Ajans Oluştur
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Ajans bilgilerini ve admin hesabını girin
                  </p>
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

              <div className="flex flex-col gap-5">
                {/* Agency Info Section */}
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Ajans Bilgileri
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Ajans Adı *
                    </label>
                    <input
                      {...register("name", {
                        onChange: (e) => autoSlug(e.target.value),
                      })}
                      disabled={isPending}
                      placeholder="Örn: Dijital Medya Ajansı"
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Slug *
                    </label>
                    <input
                      {...register("slug")}
                      disabled={isPending}
                      placeholder="dijital-medya"
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    E-posta
                  </label>
                  <input
                    {...register("email")}
                    disabled={isPending}
                    type="email"
                    placeholder="info@ajans.com"
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Separator */}
                <div className="border-t border-white/5" />

                {/* Admin User Section */}
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Admin Hesabı
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Ad *
                    </label>
                    <input
                      {...register("adminFirstName")}
                      disabled={isPending}
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.adminFirstName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.adminFirstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Soyad *
                    </label>
                    <input
                      {...register("adminLastName")}
                      disabled={isPending}
                      className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    {errors.adminLastName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.adminLastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Admin E-posta *
                  </label>
                  <input
                    {...register("adminEmail")}
                    disabled={isPending}
                    type="email"
                    placeholder="admin@ajans.com"
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.adminEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Geçici Şifre *
                  </label>
                  <input
                    {...register("adminPassword")}
                    disabled={isPending}
                    type="text"
                    placeholder="En az 6 karakter"
                    className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                  />
                  {errors.adminPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.adminPassword.message}
                    </p>
                  )}
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
                  Oluştur
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
