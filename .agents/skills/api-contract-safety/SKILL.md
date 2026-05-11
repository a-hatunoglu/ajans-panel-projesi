---
name: api-contract-safety
description: Frontend apiClient ile backend Express route'ları arasındaki request/response sözleşmesini korur. Yeni endpoint, query/mutation hook veya API response shape değişikliğinde tetiklenir. API uyumsuzlukları, eksik type tanımları ve response envelope kırılmalarını önler.
---

# API Contract Safety Skill

## Goal
Frontend `apiClient` (lib/api-client.ts) ile backend Express route'ları arasındaki veri sözleşmesini tutarlı tutmak. Agent'ın endpoint eklerken veya değiştirirken frontend-backend uyumsuzluğuna yol açmasını engellemek.

## When to use
* Yeni backend endpoint (route + controller + service) oluşturulurken.
* Mevcut endpoint'in response shape'i veya request body'si değiştirilirken.
* Frontend'de yeni TanStack Query hook veya mutation yazılırken.
* Backend Zod schema güncellenirken.

## When not to use
* Saf UI/styling değişikliklerinde (app-surface-implementation kullan).
* Marketing landing surface geliştirmelerinde.
* Database migration'larında (schema-migration-safety kullan).

## Response Envelope Standard

Tüm başarılı response'lar bu formatta olmalıdır:

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated response'lar:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

Hata response'ları:
```json
{
  "success": false,
  "error": {
    "message": "Human readable error",
    "code": "OPTIONAL_ERROR_CODE"
  }
}
```

## Endpoint Naming Convention

```
GET    /api/v1/companies                         → list
GET    /api/v1/companies/:id                     → detail
POST   /api/v1/companies                         → create
PATCH  /api/v1/companies/:id                     → update
DELETE /api/v1/companies/:id                     → delete

GET    /api/v1/companies/:companyId/contents     → nested list
POST   /api/v1/companies/:companyId/contents     → nested create
```

* Param adı nested resource'larda **parent model adı + Id**: `companyId`, `contentId`.
* Doğrudan erişim route'u varsa (örn: `GET /contents/:id`) param adı `id`.

## Frontend-Backend Type Eşleştirme Kuralları

1. **Backend Zod schema'sı source of truth'tur.** Frontend type'ları buna uymalıdır.
2. Her feature modülünde `types.ts` dosyası backend response shape'ini yansıtmalıdır.
3. `apiClient<T>` generic type parametresi her zaman belirtilmelidir — `any` yasaktır.
4. Date alanları backend'den ISO string gelir, frontend'de `string` olarak tutulur (parse gerektiğinde `date-fns`).

## Request Body Kuralları

* JSON body: `Content-Type: application/json` (default).
* File upload: `FormData` — apiClient otomatik olarak Content-Type header'ını kaldırır.
* Query parametreleri: `params` option'ı ile (URLSearchParams).
* `credentials: 'include'` otomatik uygulanır — asla kaldırılmamalıdır.

## Checklist — Yeni Endpoint Ekleme

1. ☐ Backend: route dosyasına endpoint eklendi mi?
2. ☐ Backend: Zod schema ile request validation tanımlı mı?
3. ☐ Backend: Controller → Service → Prisma query zinciri tamamlandı mı?
4. ☐ Backend: Response `{ success: true, data }` formatında mı?
5. ☐ Backend: Authenticate + authorize/companyAccess middleware uygulandı mı?
6. ☐ Frontend: `features/<module>/types.ts` güncellendi mi?
7. ☐ Frontend: `features/<module>/api/queries.ts` veya `mutations.ts` hook eklendi mi?
8. ☐ Frontend: apiClient generic type doğru mu?
9. ☐ Endpoint adı convention'a uyuyor mu?

## Constraints

* **`any` type yasaktır** — apiClient çağrılarında ve hook dönüş tiplerinde.
* **Response envelope kırılması yasaktır** — Backend her zaman `{ success, data }` veya `{ success, error }` döner.
* **Frontend'de raw `fetch` yasaktır** — Tüm API çağrıları `apiClient` üzerinden yapılmalıdır.
* **Zod schema'sız endpoint yasaktır** — Her endpoint'in request body/params Zod ile validate edilmesi zorunludur.
