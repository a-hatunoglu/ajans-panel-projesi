---
name: schema-migration-safety
description: Prisma schema değişikliklerinde veri güvenliğini sağlar. schema.prisma düzenlemesi veya prisma migrate çalıştırılmadan önce tetiklenir. Destructive migration riski, seed uyumu, index stratejisi ve rollback planı kontrolü yapar.
---

# Schema Migration Safety Skill

## Goal
Prisma schema değişikliklerinde veri kaybını, seed script kırılmasını ve production'da geri alınamaz destructive migration'ları önlemek.

## When to use
* `prisma/schema.prisma` dosyası değiştirildiğinde.
* `prisma migrate dev` veya `prisma migrate deploy` çalıştırılmadan önce.
* Yeni model, alan, relation veya index eklenirken.
* Enum değeri eklenirken veya çıkarılırken.

## When not to use
* Frontend-only değişikliklerde.
* Backend controller/service refactoring'inde (schema değişmiyorsa).
* Seed script'in kendisi güncellenirken (ama migration ile birlikte geliyorsa tetikle).

## Pre-Migration Checklist

Her schema değişikliği öncesi bu listeyi kontrol et:

### 1. Additive vs Destructive Analiz

| Tip | Örnekler | Risk |
|-----|----------|------|
| ✅ Additive | Yeni model, yeni opsiyonel alan, yeni index | Güvenli — eski kod yeni alanları yok sayar |
| ⚠️ Rename | Alan adı değişikliği | Data loss riski — rename migration gerekir |
| 🔴 Destructive | Alan silme, tablo silme, constraint değişikliği | Geri alınamaz — production'da eski kod çökebilir |

**Destructive değişiklik varsa:**
1. Önce yeni alanı ekle (additive migration)
2. Veriyi taşı (data migration script)
3. Eski alanı sil (ayrı migration)
4. Bu üç adım tek migration'da yapılmamalı

### 2. Convention Kontrolleri

```prisma
// Model adı: PascalCase, tekil
model ContentVersion { ... }

// Tablo adı: snake_case, çoğul
@@map("content_versions")

// Alan mapping: camelCase → snake_case
firstName  String  @map("first_name")

// UUID default
id  String  @id @default(uuid()) @db.Uuid

// Soft delete pattern — tüm ana modellerde olmalı
deletedAt  DateTime?  @map("deleted_at")

// Timestamp pattern
createdAt  DateTime  @default(now()) @map("created_at")
updatedAt  DateTime  @updatedAt @map("updated_at")
```

### 3. Index Stratejisi

* Foreign key alanlarına **her zaman** index ekle: `@@index([companyId])`
* Filtreleme/sıralama alanlarına index ekle: `@@index([status])`, `@@index([isRead])`
* Composite unique varsa: `@@unique([companyId, userId])`
* Boolean filtre alanları: `@@index([isRead])`, `@@index([isActive])`

### 4. Enum Kuralları

Mevcut enum'lar (`src/shared/types/enums.ts`):
- `UserRole`: owner, admin, member
- `CompanyRole`: editor, designer, client
- `ContentStatus`: draft, in_review, revise, approved, scheduled, published
- `PaymentStatus`: pending, paid, overdue
- `SocialPlatform`: instagram, facebook, x, linkedin, tiktok, youtube
- `CommentType`: comment, approval, rejection

**Enum değişiklik kuralları:**
* Yeni değer eklemek güvenlidir (additive).
* Değer silmek **destructive** — önce o değeri kullanan satırları migrate et.
* Schema'da string tip kullanılıyor (`@db.VarChar`), Prisma enum değil — esneklik sağlar ama uygulama katmanında enum kontrolü zorunlu.

### 5. Seed Script Uyumu

Her migration sonrası `scripts/dev-seed-workflow-qa.ts` sorunsuz çalışabilmeli.

Kontrol et:
* Yeni zorunlu alan eklendiyse seed script bu alanı dolduruyor mu?
* Alan siliniyorsa seed script bu alana referans veriyor mu?
* Yeni model eklendiyse seed'e eklenmesi gerekiyor mu?

### 6. Relation Kuralları

```prisma
// Cascade delete: child tablolar (versions, comments, media)
onDelete: Cascade

// SetNull: audit log referansları
onDelete: SetNull

// Restrict: asla kullanılmamalı (soft delete yaklaşımıyla çelişir)
```

## Post-Migration Kontrol

1. ☐ `prisma migrate dev` başarılı mı?
2. ☐ `prisma generate` başarılı mı?
3. ☐ `npm run dev:seed:workflow-qa` hatasız çalışıyor mu?
4. ☐ Backend `npm run build` başarılı mı?
5. ☐ `deploy-runbook.md` güncellenmesi gerekiyor mu?

## Constraints

* **Production'da `prisma migrate dev` yasaktır** — sadece `prisma migrate deploy`.
* **Tek migration'da additive + destructive karıştırma yasaktır.**
* **`@@map` olmadan model/alan ekleme yasaktır** — SQL tablo adları her zaman snake_case.
* **Index'siz FK yasaktır** — Her foreign key alanına `@@index` eklenmeli.
* **`schema.old.prisma` güncellenmeli** — Major değişikliklerde önceki versiyonun referansı korunmalı.
