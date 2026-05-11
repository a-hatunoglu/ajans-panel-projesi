---
name: frontend-performance-optimization
description: Bu projenin Next.js 14 App Router + TanStack Query + Framer Motion stack'ine özel performans kuralları. Yeni sayfa oluşturma, component refactoring veya performans iyileştirme görevlerinde tetiklenir. Bundle size, render optimizasyonu, waterfall eliminasyonu ve animation performance kapsar.
---

# Frontend Performance Optimization Skill

## Goal
Bu projenin spesifik stack'i (Next.js 14 App Router, TanStack Query, Framer Motion, Tailwind CSS) için performans kurallarını uygulamak. Jenerik performans tavsiyeleri yerine bu projenin mimarisine özel, pratikte fark yaratan optimizasyonlara odaklanmak.

## When to use
* Yeni sayfa veya feature modülü oluşturulurken.
* Mevcut component refactor edilirken.
* Bundle size veya yükleme süresi iyileştirilirken.
* Framer Motion animation performance sorunlarında.
* TanStack Query request dedup/cache stratejisi kurulurken.

## When not to use
* Backend-only değişikliklerde.
* Database migration'larında.
* Marketing landing surface'te (farklı performans profili).

## Bundle Optimizasyonu

### Dynamic Import Kuralları

```typescript
// ✅ Ağır component'ler lazy load edilmeli
import dynamic from 'next/dynamic';
const CalendarView = dynamic(() => import('@/features/calendar/components/calendar-view'), {
  loading: () => <PageStatePanel title="Takvim yükleniyor..." />,
});

// ✅ Dialog/Drawer/Modal içerikleri lazy load
const EditCompanyDialog = dynamic(() => import('./edit-company-dialog'));

// ❌ Küçük, sık kullanılan component'ler lazy load edilmemeli
// Button, Badge, PageContainer gibi temel bileşenler statik import olmalı
```

### Barrel File Yasağı

```typescript
// ❌ YANLIŞ — Tüm feature'ı bundle'a çeker
import { CompanyList, CompanyDetail, CreateCompanyDialog } from '@/features/companies';

// ✅ DOĞRU — Sadece gerekli component import edilir
import { CompanyList } from '@/features/companies/components/company-list';
```

### Icon Import

```typescript
// ✅ DOĞRU — Named import, tree-shakeable
import { Building2, Plus, Search } from 'lucide-react';

// ❌ YANLIŞ — Tüm icon setini çeker
import * as Icons from 'lucide-react';
```

## Render Optimizasyonu

### React.memo Ne Zaman Gerekli

```typescript
// ✅ GEREKLI — Liste item'ları (parent re-render'da gereksiz render önlenir)
const ContentListItem = React.memo(function ContentListItem({ content }: Props) {
  return <div>...</div>;
});

// ✅ GEREKLI — Sık güncellenen parent'ın statik child'ları
const DashboardWidgetWrapper = React.memo(function DashboardWidgetWrapper({ children }: Props) {
  return <div>...</div>;
});

// ❌ GEREKSİZ — Zaten kendi state'ini yöneten bağımsız page component'ler
// ❌ GEREKSİZ — Tek yerde kullanılan basit component'ler
```

### Inline Component Yasağı

```typescript
// ❌ YANLIŞ — Her render'da yeni component oluşturur
function ParentComponent() {
  const ItemRenderer = ({ item }) => <div>{item.name}</div>; // her render yeni ref
  return items.map(item => <ItemRenderer item={item} />);
}

// ✅ DOĞRU — Component dışında tanımla
const ItemRenderer = ({ item }: { item: Item }) => <div>{item.name}</div>;
function ParentComponent() {
  return items.map(item => <ItemRenderer key={item.id} item={item} />);
}
```

## Framer Motion Performance

```typescript
// ✅ Kısa, kontrollü transition (repo rules: short, controlled, contextual)
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
/>

// ❌ Uzun, dekoratif animation
<motion.div
  animate={{ scale: [1, 1.2, 1], rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity }}
/>

// ⚠️ layout prop dikkatli kullan — gereksiz layout thrash'e neden olabilir
// Sadece gerçekten position/size değişen element'lerde kullan
<motion.div layout layoutId={`card-${id}`} />
```

## TanStack Query Performance

```typescript
// ✅ staleTime ile gereksiz refetch önle
useQuery({
  queryKey: ['companies'],
  queryFn: fetchCompanies,
  staleTime: 30 * 1000, // 30 saniye fresh kabul et
});

// ✅ Parallel fetch — bağımsız query'ler paralel çalışır (otomatik)
const companies = useQuery({ queryKey: ['companies'], queryFn: fetchCompanies });
const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
// İkisi de aynı anda fetch edilir

// ❌ Waterfall — birini bekleyip diğerini fetch etme (zorunlu olmadıkça)
```

## Constraints

* **`use client` minimizasyonu** — Mümkün olduğunca server component kullan, client directive'i sadece interaktif component'lerde.
* **Büyük JSON verisi prop olarak geçirme** — TanStack Query cache'ten oku.
* **`console.log` production'da yasak** — Geliştirme logları temizlenmeli.
* **Unnecessary re-render kabul edilemez** — Liste item'ları memo, callback'ler stable.
