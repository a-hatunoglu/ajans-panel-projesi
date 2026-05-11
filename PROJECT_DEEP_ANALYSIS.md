# Proje Derinlemesine Analizi (PROJECT_DEEP_ANALYSIS)

## 1. Proje Özeti ve Amacı
Bu proje, sosyal medya ajanslarının tüm operasyonlarını tek bir merkezden, rol tabanlı ve güvenli bir şekilde yönetmelerini sağlayan **"Premium Social Media Agency Management Platform"**dur. 
Proje, ajansların müşterileri (company), içerik üreticileri (designer/editor) ve onay süreçlerini tek bir platformda birleştirerek operasyonel karmaşayı çözmeyi hedefler. Vercel estetiğinden ilham alan, "dark-first" (karanlık mod öncelikli) ve yüksek kaliteli bir tasarıma sahiptir.

**Hedef Kullanıcılar:** 
- Ajans sahipleri ve yöneticileri
- Tasarımcılar ve metin yazarları/editörler
- Ajansın hizmet verdiği müşteriler (onay ve takip için)

## 2. Mimari ve Dizin Yapısı
Proje, mantıksal olarak ikiye ayrılmış bir **Monorepo** yapısındadır:
- **Root (`/src`)**: Express.js ve Prisma kullanılarak yazılmış RESTful API tabanlı Node.js backend.
- **`/frontend`**: Next.js 14 (App Router) ile yazılmış, Tailwind CSS ve shadcn/ui kullanan frontend uygulaması.

### Ana Modüller:
1. **Agencies & Companies:** Çoklu kiracı (multi-tenant) yapısı. Ajanslar ve ajanslara bağlı şirketler (müşteriler).
2. **Auth & Users:** HttpOnly cookie tabanlı, JWT (Access/Refresh token) kullanan kimlik doğrulama.
3. **Roles & Permissions:** Sistem geneli, ajans bazlı ve şirket bazlı granüler yetkilendirme.
4. **Contents & Workflow:** İçeriklerin yaşam döngüsü yönetimi (`draft` -> `in review` -> `approved` -> `scheduled` -> `published`).
5. **Social Accounts:** Şirketlerin sosyal medya hesaplarının yönetimi.
6. **Notifications:** Okunma durumu takipli bildirim sistemi.
7. **Payments:** Müşterilerin ödeme ve fatura takipleri.

## 3. Frontend Yapısı (Next.js 14 App Router)
- **Yüzeyler (Surfaces):**
  - **Marketing / Landing:** `(app)` rotası dışında, `/`, `/features`, `/workflow` gibi public sayfalar.
  - **Auth Yüzeyi:** `/login` ve ilgili auth sayfaları.
  - **Authenticated App:** `/(app)` altında yer alan, yetki duvarı arkasındaki asıl yönetim paneli (`/app/companies`, `/app/contents` vb.). Dashboard rotası `/app` olarak kurgulanmıştır (`/dashboard` DEĞİL).
- **Styling:** Tailwind CSS, shadcn/ui, framer-motion. Karanlık mod (dark-first) ve 1px border ayrımı, az gölgeli Vercel-like tasarım dili.
- **State & Data Fetching:** TanStack Query (React Query) ile server-state yönetimi, lokal UI state'ler için `useState`. Redux veya Zustand kullanılmamaktadır.
- **Forms:** React Hook Form ve Zod.

## 4. Backend Yapısı (Express.js)
- **Framework:** Express.js + TypeScript (`src/server.ts`).
- **Veritabanı Erişim (ORM):** Prisma ORM (`prisma/schema.prisma`).
- **Kimlik Doğrulama:** JWT (JSON Web Token) ile Access ve Refresh token mantığı. Tokenlar güvenli bir şekilde `HttpOnly` cookie'lerde saklanıyor.
- **Dosya Yükleme (Media):** S3/MinIO uyumlu depolama altyapısı hazır (`ContentMedia` tablosu).
- **Arka Plan İşleri:** Cron benzeri yapı (Node `setInterval` ile çalışan süreçler, örn. süresi geçen içerikleri belirleme).

## 5. Veri Modeli ve Yetkilendirme (Database Schema)
**Veritabanı:** PostgreSQL
- `User`: Tüm sistemdeki fiziksel kişiler.
- `Agency` & `AgencyUser`: Ajans ve ajans yöneticisi/çalışanı ilişkilendirmesi.
- `Company`, `CompanyUser` & `CompanyUserRole`: Ajansın müşterileri. Bir kullanıcı bir şirkette `editor`, `designer` veya `client` rolüne sahip olabilir.
- `Content`, `ContentVersion`, `ContentComment`: İçerik üretim, versiyonlama ve yorumlaşma/onaylaşma altyapısı.
- `SocialAccount`: İçeriğin ait olduğu sosyal medya hesapları.
- `Payment` & `Notification`: Finansal takipler ve sistem bildirimleri.

## 6. Mevcut Durum ve Kalan İşler
**Tamamlananlar:**
- Express & Next.js iskeleti, Prisma veritabanı kurulumu.
- Auth sistemi (Cookie tabanlı login/refresh flow).
- Rol mekanizması, yetki duvarları.
- Temel Workflow mekanizması (taslak, onaya gönderme, onaylama işlemleri).
- Playwright E2E test altyapısı (Türkçe'ye çevrilmiş).

**Eksik/Tamamlanacak İşler (Rapordan Çıkanlar):**
- Medya/Dosya Yükleme (S3 entegrasyonunun aktifleşmesi ve UI).
- Landing page / Marketing yüzeyi eksikleri (Sadece Silk/Border Glow efektlerine sınırlı izin var).
- Takvim (Calendar) kütüphane seçimi ve entegrasyonu.
- Payments (Ödemeler) ve Notifications (Bildirimler) UI/UX tamamlamaları.
- Yeni bilgisayarda `.env` eksikleri ve lokal DB verisinin (seed) yeniden oluşturulması.

## 7. Analizde Kullanılan Araçlar ve Kurallar
- `.agents/skills/*` altındaki tüm skill dosyaları incelenmiş ve platformun kurallarına (özellikle `app-surface-implementation`, `role-safe-feature-implementation`, `query-mutation-cache-discipline`) sadık kalınmıştır.
- `REPO_RULES.md` içindeki kesin tasarım kararları ("Vercel-inspired", "Dark-first", "No Redux", "HttpOnly Cookies") rehber kabul edilmiştir.
- Kişisel varsayımlardan kaçınılmış, veritabanı şeması ve package.json dosyalarındaki bağımlılıklar üzerinden mimari raporlanmıştır.
