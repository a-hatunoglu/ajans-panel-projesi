---
name: query-mutation-cache-discipline
description: TanStack Query ile server state yönetimi, cache invalidation, optimistic update ve loading/error/empty state pattern disiplini. Yeni query/mutation hook yazılırken, data fetching refactoring yapılırken veya cache tutarsızlığı giderilirken tetiklenir.
---

# Query Mutation Cache Discipline Skill

## Goal
TanStack Query (React Query) kullanımında tutarlılık sağlamak. Query key convention, cache invalidation stratejisi, loading/error state yönetimi ve mutation sonrası veri senkronizasyonunu standartlaştırmak.

## When to use
* Yeni TanStack Query hook (useQuery/useMutation) yazılırken.
* Mevcut data fetching mantığı refactor edilirken.
* Cache tutarsızlığı veya stale data sorunu çözülürken.
* Yeni sayfa veya feature modülü oluşturulurken (data layer).

## When not to use
* Backend-only değişikliklerde (API endpoint'leri için `api-contract-safety` kullan).
* Saf UI/styling değişikliklerinde.
* Marketing landing surface'te.

## Query Key Convention

Hiyerarşik, predictable ve invalidation-friendly key yapısı:

```typescript
// Pattern: [resource, ...identifiers, filters?]

// Listeler
['companies']
['companies', { page: 1, search: 'atlas' }]
['contents', { companyId, status: 'draft', page: 1 }]

// Detay
['companies', companyId]
['contents', contentId]

// Nested resource
['companies', companyId, 'contents']
['companies', companyId, 'contents', { page, status }]
['companies', companyId, 'payments']
['companies', companyId, 'users']

// Dashboard (aggregate)
['dashboard', { role }]
['dashboard', 'stats']
```

### Key Factory Pattern

Her feature modülünde query key factory kullan:

```typescript
// features/companies/api/queries.ts
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters: CompanyFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};
```

## Mutation Sonrası Cache Invalidation

### Kural: Mutation tamamlandığında ilgili query'ler invalidate edilmeli

```typescript
const createCompany = useMutation({
  mutationFn: (data) => apiClient('/companies', { method: 'POST', body: JSON.stringify(data) }),
  onSuccess: () => {
    // İlgili listeleri invalidate et
    queryClient.invalidateQueries({ queryKey: companyKeys.all });
    // Dashboard stats da etkilenebilir
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  },
});
```

### Invalidation Matrisi

| Mutation | Invalidate Edilecek Query'ler |
|----------|------------------------------|
| Company create | `['companies']`, `['dashboard']` |
| Company update | `['companies']`, `['companies', id]` |
| Company delete | `['companies']`, `['dashboard']` |
| Content create | `['contents']`, `['companies', companyId, 'contents']`, `['dashboard']` |
| Content status change | `['contents', id]`, `['companies', companyId, 'contents']`, `['dashboard']`, `['calendar']` |
| Payment create/update | `['payments']`, `['companies', companyId, 'payments']`, `['dashboard']` |
| Notification read | `['notifications']` |

## Loading / Error / Empty State Sırası

Her sayfa ve liste bu state'leri sırasıyla yönetmelidir:

```typescript
// 1. Auth loading
if (isAuthLoading) return <PageStatePanel title="..." />;

// 2. Data loading (ilk yükleme)
if (isLoading && !data) return <PageStatePanel title="Yükleniyor..." />;

// 3. Error (veri yokken)
if (isError && !data) return <PageStatePanel title="Hata" />;

// 4. Empty state
if (data && data.items.length === 0) return <EmptyState />;

// 5. Data render (stale data varken error gösterimi inline)
return (
  <>
    {isError && data && <InlineErrorBanner />}
    <DataList items={data.items} />
  </>
);
```

## Hook Yazım Kuralları

```typescript
// ✅ DOĞRU — enabled ile conditional fetching
export function useCompanyDetail(id: string | undefined) {
  return useQuery({
    queryKey: companyKeys.detail(id!),
    queryFn: () => apiClient<ApiResponse<Company>>(`/companies/${id}`),
    enabled: !!id,
  });
}

// ❌ YANLIŞ — enabled olmadan, id undefined olabilir
export function useCompanyDetail(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => apiClient(`/companies/${id}`),
  });
}
```

## Constraints

* **Raw fetch yasaktır** — Tüm server state TanStack Query üzerinden yönetilmeli.
* **Query key string literal yasaktır** — Key factory pattern kullanılmalı.
* **Mutation sonrası invalidation unutulmamalı** — Her mutation'ın `onSuccess`'inde ilgili query'ler invalidate edilmeli.
* **`any` return type yasaktır** — Hook dönüş tipleri açık olmalı.
* **Global state'e API verisi kopyalanmamalı** — useState'e API response'u kopyalamak yerine TanStack Query cache kullanılmalı.
