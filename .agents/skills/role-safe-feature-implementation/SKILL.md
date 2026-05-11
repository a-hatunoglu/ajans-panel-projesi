---
name: role-safe-feature-implementation
description: Owner, Admin, Editor, Designer ve Client rolleri arasında görünürlük izolasyonu sağlayan UI yetki duvarı ve mutlak backend doğrulama kural seti. Yeni endpoint, yetki kısıtlaması, rol filtresi veya kaynak erişim kontrolü yazarken tetiklenir.
---

# Role-Safe Feature Implementation Skill

## Goal
Owner, Admin, Editor, Designer ve Client hiyerarşisi doğrultusunda güvenli backend/frontend tam yığın (full-stack) geliştirme yapmak. Sadece arayüzden buton gizlemekle sınırlı kalmayıp, Express middleware/Route ve Prisma sorgularında katı bir role bazlı izolasyon sağlamaktır.

## When to use
* Herhangi bir kaynağın (şirket, içerik, ödeme, kullanıcı vb.) endpoint'i oluşturulurken veya değiştirilirken.
* Frontend'de görünürlük yetkileri kısıtlanırken veya şartlı route kurgusu yapılırken (`useContext`, session kontrolü).
* Kullanıcı rolüne (örneğin Client'ın sadece okuma/onaylama, Designer'ın sadece atandığı işi görme vs.) özel mantık yazılırken.
* Content workflow status geçişlerinde `canTransition()` ile rol yetki kontrolü yapılırken.

## When not to use
* Saf (pure) UI komponentleri geliştirilirken veya animasyon, sayfa geçişleri, form validasyon kuralları gibi styling işlemlerinde.
* Marketing landing surface'te geliştirme yaparken.

## Rol Mimarisi

Bu projede **iki katmanlı** rol sistemi vardır:

### Global Roller (User.role)
Sistem seviyesinde yetki. `src/middleware/authorize.ts` ile kontrol edilir.

| Rol | Hiyerarşi | Yetki |
|-----|-----------|-------|
| `owner` | 4 | Tam erişim, kullanıcı yönetimi, tüm şirketlere erişim |
| `admin` | 3 | Tam erişim, kullanıcı yönetimi, tüm şirketlere erişim |
| `member` | 1 | Hiçbir global yetki — yetkileri tamamen CompanyUserRole'den gelir |

### Operasyonel Roller (CompanyUserRole)
Şirket bazlı görev rolü. `company_user_roles` join table'ında tutulur.

| Rol | Kapsam |
|-----|--------|
| `editor` | İçerik oluşturma, düzenleme, planlama, yayınlama |
| `designer` | Kendisine atanan içeriklerde görsel çalışma |
| `client` | Sadece okuma + onay/revize (kendine ait şirket) |

### Erişim Akışı
```
Request → authenticate → authorize(globalRole) → companyAccess(paramName) → controller
                                                        ↓
                                              req.user.role (global)
                                              req.companyRoles[] (operational)
                                              req.company (company context)
```

## Instructions

### Backend Middleware Zinciri

Her korumalı endpoint şu sırayı takip etmelidir:

```typescript
// Örnek: Şirket içerik listesi
router.get('/',
  authenticate,                          // 1. Kim olduğunu doğrula
  companyAccess('companyId'),             // 2. Şirkete erişimi kontrol et + req.companyRoles doldur
  contentsController.listByCompany       // 3. İş mantığı
);

// Örnek: Sadece owner/admin erişimi
router.delete('/:id',
  authenticate,
  authorize(UserRole.OWNER, UserRole.ADMIN),  // Global rol kontrolü
  companyAccess('companyId'),
  contentsController.delete
);
```

### companyAccess Middleware Davranışı

`src/middleware/company-access.ts` şunu yapar:
1. `req.params[paramName]` ile şirket ID'sini alır
2. Şirketin var ve aktif olduğunu doğrular
3. Owner/Admin → otomatik erişim (tüm şirketlere)
4. Member → `company_users` tablosunda kayıt aranır, yoksa 403
5. `req.company`, `req.companyRoles[]` set eder

### Content Workflow Rol Kontrolü

`src/modules/contents/contents.state-machine.ts` içindeki `canTransition()` hem global hem operasyonel rolleri kontrol eder:

```typescript
// Geçiş yapılabilir mi?
const actorRoles = [req.user.role, ...req.companyRoles];
if (!canTransition(content.status, newStatus, actorRoles)) {
  throw new ForbiddenError('Bu geçiş için yetkiniz yok.');
}
```

### Frontend Rol Filtreleme

```typescript
// useAuth() ile kullanıcı bilgisi
const { user } = useAuth();
const isOwnerOrAdmin = ['owner', 'admin'].includes(user?.role);

// useCompanyRoles() ile operasyonel roller
const { roles } = useCompanyRoles(companyId);
const isEditor = roles.includes('editor');

// UI'da şartlı render
{isOwnerOrAdmin && <DeleteButton />}
```

### Prisma Query Güvenliği

```typescript
// ❌ YANLIŞ — Herkes her şeyi görebilir
const contents = await prisma.content.findMany();

// ✅ DOĞRU — Şirket filtresi zorunlu
const contents = await prisma.content.findMany({
  where: {
    companyId: req.company.id,
    deletedAt: null,
  },
});

// ✅ DOĞRU — Designer sadece kendine atananları görür
const contents = await prisma.content.findMany({
  where: {
    companyId: req.company.id,
    assignedDesignerId: req.user.id,
    deletedAt: null,
  },
});
```

## Constraints
* **Eksik Doğrulama Yasaktır:** "Frontend'den gizledim, backend sorgusunda id yollaması yeterli" varsayımı kabul edilemez.
* **Çoklu Arayüz Yasaktır:** Roller farklılaştığı için `ClientApp` veya `EditorApp` gibi ayrı klasör/frontend kurmak kesinlikle yasaktır, her senaryo `/app` kabuğunda role filter yaklaşımı ile yönetilir.
* **Gevşek Prisma Kurgusu:** Veritabanında Owner dışı kullanıcıların rastgele verileri dump (çekme) ihtimalini kapatacak `where` şartları her defasında kurulmalıdır.
* **companyAccess Atlanması Yasaktır:** Şirket bazlı kaynaklara erişen her endpoint `companyAccess` middleware kullanmalıdır.
* **Rol Hard-coding Yasaktır:** Rol string'leri için `UserRole` ve `CompanyRole` enum'ları kullanılmalıdır.

## Output
Her rol için yetki sınırlarının kusursuz eşleştiği hem `frontend` UI kısıtlamalarını içeren hem de Express API üzerinde kurşun geçirmez kılan tam çalışır full-stack güvenlik kodu.
