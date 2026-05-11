---
name: production-readiness-checklist
description: Deploy öncesi son kontrol skill'i. "Deploy", "production", "release", "yayına al" görevlerinde tetiklenir. Backend build, frontend build, env validation, database migration durumu, CORS, SMTP, S3 ve güvenlik kontrollerini kapsar.
---

# Production Readiness Checklist Skill

## Goal
Production deploy öncesinde tüm kritik kontrollerin yapıldığından emin olmak. Deploy-runbook.md ile uyumlu, sistematik bir son kontrol mekanizması.

## When to use
* "Deploy", "production", "release", "yayına al" gibi görevlerde.
* Staging/production ortamına geçiş hazırlığında.
* Major feature branch merge öncesi.
* `verify:prod-boot` çalıştırıldığında.

## When not to use
* Lokal development iterasyonlarında.
* Feature geliştirme sırasında (diğer skill'ler yeterli).
* Marketing/landing sayfası güncellemelerinde.

## Pre-Deploy Checklist

### 1. Backend Build ✅

```bash
cd "c:\Users\Akif\Desktop\ajans panel projesi"
npm run build                    # prisma generate && tsc
npm run verify:prod-boot         # Build → start → health check → shutdown
```

Her ikisi de hatasız tamamlanmalıdır.

### 2. Frontend Build ✅

```bash
cd frontend
npm run typecheck                # tsc --noEmit
npm run build                    # next build
npm run lint                     # eslint
```

Build warning'leri not al, error'lar bloke eder.

### 3. Environment Variables ✅

Zorunlu değişkenler (eksik = boot fail):

| Değişken | Kontrol |
|----------|---------|
| `DATABASE_URL` | PostgreSQL bağlantı stringi, URL formatı |
| `JWT_ACCESS_SECRET` | Min 32 karakter, kriptografik random |
| `JWT_REFRESH_SECRET` | Min 32 karakter, access secret'ten farklı |

Production-critical opsiyoneller:

| Değişken | Kontrol |
|----------|---------|
| `NODE_ENV` | `production` olmalı |
| `CORS_ORIGINS` | Frontend domain dahil olmalı |
| `STORAGE_S3_*` | Tüm S3 değişkenleri set olmalı (production'da zorunlu) |
| `SMTP_HOST` | Set olmalı (production'da server boot'ta fail eder) |
| `CLIENT_URL` | Frontend production URL'i |
| `APP_URL` | Backend production URL'i |

### 4. Database Migration ✅

```bash
npx prisma migrate status       # Pending migration var mı?
```

- Pending migration varsa: `npm run start:prod` otomatik uygular
- Migration'lar additive mi destructive mi kontrol et
- `deploy-runbook.md` Scenario A/B rehberini oku

### 5. Connectivity ✅

| Servis | Kontrol |
|--------|---------|
| PostgreSQL | `DATABASE_URL` ile bağlantı başarılı mı? |
| S3/MinIO | Bucket erişilebilir mi? Upload test |
| SMTP | Test email gönderilebiliyor mu? |
| Frontend → Backend | CORS doğru yapılandırılmış mı? |

### 6. Security ✅

- [ ] `helmet()` aktif mi? (app.ts'de var)
- [ ] Rate limit yapılandırılmış mı? (default: 100 req/min)
- [ ] Auth rate limit ayrı mı? (default: 5 req/min)
- [ ] Cookie `secure: true` production'da?
- [ ] Cookie `sameSite: strict` production'da?
- [ ] `trust proxy` ayarı doğru mu?

### 7. Background Jobs ✅

Boot sonrası 30 saniye gecikmeyle başlar:
- Overdue check (1 saat interval)
- Trash cleanup (24 saat interval)

Log'larda başlangıç mesajlarını doğrula.

### 8. Seed Data Temizliği ✅

Production'da QA seed data'sının kalmaması gerekir:
- `[QA]` prefix'li içerikler
- `[Demo]` prefix'li notification'lar
- `_demo: true` flag'li activity log'lar
- Test user'lar (örn: `@test.com` email'ler)

## Deploy Sırası

```
1. Database hazırlığı (PostgreSQL erişilebilir)
2. Backend deploy (npm run start:prod → migrate + boot)
3. Backend health check (GET /api/v1/health → 200)
4. Frontend deploy (npm run build && npm run start)
5. E2E smoke test (login → dashboard → console errors)
```

**Backend her zaman frontend'den önce deploy edilmelidir.**

## Rollback Rehberi

Detaylı rehber: `docs/deploy-runbook.md`

| Senaryo | Aksiyon |
|---------|---------|
| Frontend hatası | Frontend'i önceki version'a dön (güvenli) |
| Backend hatası (migration çalışmadı) | Backend'i önceki version'a dön (güvenli) |
| Backend hatası (additive migration çalıştı) | Backend'i önceki version'a dön (güvenli — eski kod yeni kolonları yok sayar) |
| Backend hatası (destructive migration çalıştı) | 🔴 Hotfix forward veya DB restore gerekli |

## Constraints

* **Checklist atlanması yasaktır** — Her madde kontrol edilmeli.
* **Backend'siz frontend deploy yasaktır** — Backend önce hazır olmalı.
* **Production'da `prisma migrate dev` yasaktır** — Sadece `prisma migrate deploy`.
* **Test data production'da yasaktır** — QA seed'i temizle.
