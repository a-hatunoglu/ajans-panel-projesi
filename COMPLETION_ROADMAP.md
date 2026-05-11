# Proje Tamamlama Yol Haritası (COMPLETION_ROADMAP)

Aşağıdaki yol haritası, yarım kalmış projenin güvenli bir şekilde diriltilmesi ve planlanan özelliklerin sırayla tamamlanması için oluşturulmuştur.

## 🟢 Batch 0 — Yeni PC Ortamını Doğrulama
- **Amaç:** Bağımlılıkların ve Node.js/Docker altyapısının eksiksiz olduğunu teyit etmek.
- **İşler:** Node versiyon tespiti, `docker-compose` çalışabilirliği, `.env` dosyalarının şablonlardan türetilmesi.
- **Başarı Kriteri:** Hata almadan Docker konteynerlerinin ayağa kalkması ve npm sürümlerinin okunabilmesi.

## 🟢 Batch 1 — Projeyi Lokal Ayağa Kaldırma
- **Amaç:** Projenin compile ve build olabildiğini görmek.
- **İşler:** Backend ve Frontend `npm install` komutlarının çalıştırılması. Prisma client'ın generate edilmesi ve db migration'ların database'e uygulanması.
- **Riskler:** Eksik build tool'ları veya OS bazlı native bağımlılık hataları.
- **Başarı Kriteri:** Terminalde `npm run dev` komutlarının hata vermeden dinlemeye geçmesi.

## 🟢 Batch 2 — Backend Sağlık Kontrolü
- **Amaç:** Veritabanı ve API haberleşmesini doğrulamak.
- **İşler:** `/api/v1/health` endpointine istek atılması. `dev-seed-workflow-qa.ts` scriptinin çalıştırılarak veritabanına test kullanıcılarının yüklenmesi.
- **Başarı Kriteri:** Seed scriptinin başarıyla bitmesi ve Prisma üzerinden DB'den veri okunabilmesi.

## 🟢 Batch 3 — Frontend Sağlık Kontrolü
- **Amaç:** Arayüzün backend ile iletişim kurabildiğini kanıtlamak.
- **İşler:** Playwright veya manuel yöntemlerle UI'ın ana sayfasının yüklenmesi, API'ye atılan ilk isteklerin (örneğin session check) CORS hatası vermeden dönmesi.
- **Başarı Kriteri:** Ekranda UI bileşenlerinin render olması ve tarayıcı konsolunda kırmızı hata (500 veya CORS) olmaması.

## 🟡 Batch 4 — Auth / Role / Permission Doğrulama
- **Amaç:** Yeni sistemde cookielerin ve giriş yapısının bozulmadığını kontrol etmek.
- **İşler:** Owner, Admin ve Client hesaplarıyla ayrı ayrı login olup yetki duvarlarının test edilmesi.
- **Riskler:** `HttpOnly` cookie'lerin localhost domain konfigürasyonundan dolayı browser tarafından reddedilmesi.
- **Başarı Kriteri:** Başarıyla oturum açılması ve sayfa yenilendiğinde oturumun kapanmaması.

## 🟡 Batch 5 — Ana Workflow Testleri
- **Amaç:** İçerik onay döngüsünün çalıştığından emin olmak.
- **İşler:** Bir taslak (draft) içerik oluşturmak, onaya göndermek (in review) ve yayınlamak (published).
- **Başarı Kriteri:** Database'deki `status` kolonunun başarıyla güncellenmesi ve UI'da doğru state'in yansıması.

## 🟠 Batch 6 — Eksik veya Bozuk Özelliklerin Tespiti (Keşif)
- **Amaç:** Yapılmış olması gereken ama eksik olan kısımları netleştirmek.
- **İşler:** Playwright testlerinin (E2E) koşturulması (`npm run test:smoke`), TODO ve FIXME notlarının taranması.
- **Başarı Kriteri:** Bozuk yerlerin net bir listesinin çıkarılması.

## 🟠 Batch 7 — Öncelikli Bug Fix Listesi
- **Amaç:** Mevcut kodu kararlı (stable) hale getirmek.
- **İşler:** E2E testlerden patlayan hataların çözümü, responsive bozuklukların veya TypeScript derleme hatalarının giderilmesi.
- **Başarı Kriteri:** `tsc --noEmit` ve `next lint` komutlarının sıfır hata döndürmesi.

## 🔴 Batch 8 — Tamamlama Roadmap'i (Yeni Geliştirmeler)
- **Amaç:** Projenin geri kalan epik görevlerini geliştirmek.
- **İşler:**
  1. Dosya yükleme ve S3/MinIO altyapısının UI entegrasyonu (Media Management).
  2. Bildirimler (Notifications) sisteminin gerçek zamanlı çalıştırılması (Socket.io).
  3. Takvim (Calendar) UI görünümü ve entegrasyonu.
  4. Ödemeler (Payments) ekranlarının tasarımı.
- **Kurallar:** Repodaki `role-safe-feature-implementation` kurallarına birebir uyulacak.

## 🔴 Batch 9 — Final QA ve Teslim Hazırlığı
- **Amaç:** Projeyi canlı (production) ortama hazırlamak.
- **İşler:** `production-readiness-checklist` skill'inin çalıştırılması.
- **Başarı Kriteri:** Deploy'a hazır, test edilmiş, performans optimizasyonu yapılmış (örneğin Framer Motion optimizasyonları) bir ürün.
