---
name: app-surface-implementation
description: Next.js ana uygulama yüzeyi (dashboard, sayfa, drawer, modal, vs.) için karanlık (dark-first), Vercel tarzı, rol tabanlı geliştirme kural seti. /app dizininde yeni sayfa, component, layout veya feature modülü oluşturulurken tetiklenir.
---

# App Surface Implementation Skill

## Goal
`/app` içindeki sayfa, detail, drawer, modal, table, filter, form ve status surface işlerini; "dark-first", "premium", ve "düşük gürültülü (low-noise)" repo felsefesine uygun geliştirmek. Amacımız, sıradan veya oyuncak hissi veren admin panellerden kaçınarak operasyon ekibi için temiz, tek uygulamalı (single-app) bir komuta merkezi arayüzü inşa etmektir.

## When to use
* `/app` dizininde yeni sayfa, bileşen (component), drawer, modal veya layout ekleneceğinde.
* Listeler, filtreler, tablolar ve React Hook Form tabanlı form arayüzü geliştirileceğinde.
* TanStack Query yardımıyla backend verilerini arayüzde (table, status) görselleştirirken.

## When not to use
* Backend veritabanı şeması modifikasyonlarında, middleware yetki güncellemelerinde veya salt mimari yapılandırmalarda (Bu süreçler için `role-safe-feature-implementation` kullan).
* İçerik (content) modüllerinde özel statü makinesi mantıkları yürütürken (Bunun için `workflow-state-implementation` kullan).
* Marketing landing surface geliştirmelerinde.

## Feature-Based Dosya Yapısı

Her yeni feature modülü şu yapıyı takip etmelidir:

```
frontend/src/features/<feature-name>/
├── api/
│   ├── queries.ts       # TanStack Query hooks (useQuery)
│   └── mutations.ts     # TanStack Mutation hooks (useMutation)
├── components/
│   ├── feature-list.tsx
│   ├── feature-detail.tsx
│   └── feature-dialog.tsx
├── types.ts             # Backend response type tanımları
├── schema.ts            # Zod form validation schemas (varsa)
└── mock-data.ts         # Dev/test mock data (opsiyonel)
```

Sayfa route dosyaları `frontend/src/app/(app)/app/<feature>/page.tsx` altındadır.

## Sayfa Şablonu

Her app sayfası bu pattern'i takip etmelidir:

```tsx
"use client";

import { PageContainer } from "@/components/shared/page-container";
import { PageStatePanel } from "@/components/shared/page-state-panel";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/i18n/provider";

export default function FeaturePage() {
  const { t } = useI18n();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data, isLoading, isError } = useFeatureData();

  if (isAuthLoading || (isLoading && !data)) {
    return <PageStatePanel title={t("feature.loading")} />;
  }

  if (isError && !data) {
    return <PageStatePanel title={t("feature.error")} />;
  }

  return (
    <PageContainer>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">
            {t("feature.title")}
          </h1>
          <p className="text-sm text-zinc-400">{t("feature.subtitle")}</p>
        </div>
      </div>
      {/* Content */}
    </PageContainer>
  );
}
```

## i18n Zorunluluğu

* Tüm kullanıcı-görünür metinler `useI18n()` hook'u + `t()` fonksiyonu ile çağrılmalıdır.
* Hard-coded Türkçe/İngilizce string yasaktır.
* Yeni key'ler hem `i18n/messages/tr.ts` hem `i18n/messages/en.ts` dosyalarına eklenmelidir.
* Key naming: `feature.section.label` pattern (örn: `dashboard.stats.totalContents`).

## Tasarım Kuralları

1. Veri gösterimi için custom Tailwind component'leri minimal ve 1px border'lı olacak şekilde tasarlayın.
2. Formları React Hook Form + Zod stack'ini kullanarak kurun.
3. Gölge (Shadow) ve parlamaları (Glow) sınırlayın — sadece modal/drawer/dropdown'da shadow kullanın.
4. Hover etkileşimlerini Framer Motion ile incelikli geçişlerle hazırlayın (duration: 0.15-0.25s, ease: easeOut).
5. Renk paleti: `zinc-950` background, `zinc-800/900` surface, `white/zinc-100` text, `blue-500` accent.
6. Status badge'leri muted tonlarda olmalı — neon renk yasak.
7. Tasarımı mobile de hazırlayın ancak önceliğin "dashboard operasyonel deneyimi (masaüstü)" olduğunu unutmayın.

## Constraints
* **Generic Şablon Hissi Yasaktır:** Karmaşık widget koleksiyonları veya her veriyi rengarenk chart ile süsleme yoluna gidilemez.
* **UI'da Parlama Yasak:** Çalışma yüzeylerinde (surface), statüler haricinde dikkat dağıtıcı renk kullanılamaz; serin bir mavi ton harici accent color yasaktır.
* **Tek Uygulama Kuralı:** Yeni bir rol eklense dahi `/dashboard` vs. gibi alternatif bir framework kurulamaz. Herkes `/app` yüzeyini kullanmalı.
* **i18n Atlanması Yasaktır:** Kullanıcı-görünür her metin i18n key üzerinden gelmeli.

## Output
Gürültüsüz, erişilebilir, `REPO_RULES.md` sınırlarıyla hizalanmış ve dark-mode premium standartlarını tam karşılayan React bileşenleri / Next.js route kodları oluşturur.