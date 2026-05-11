# Riskler ve Belirsizlikler (RISK_AND_UNKNOWN_LIST)

Projenin yeni bir bilgisayara taşınması ve önceki geliştirme seanslarından kalan durumları baz alınarak tespit edilen potansiyel riskler aşağıda listelenmiştir.

## 1. Local Çevre (Environment) Kayıpları ⚠️
- Eski bilgisayarda yer alan `.env` dosyaları git reposunda (haklı olarak) bulunmadığı için, bazı harici servis anahtarları kaybolmuş olabilir.
- **Risk:** SMTP (E-posta gönderim ayarları), S3 (Dosya depolama gerçek cloud ayarları) gibi harici servis entegrasyon şifrelerinin tekrar bulunması gerekecek.
- **Aksiyon:** Şimdilik geliştirme ortamı için local MinIO (S3 alternatifi) ve e-posta loglama kullanılacak.

## 2. Veritabanı (Veri Kaybı) 💾
- Projenin kendisi duruyor olsa da, PostgreSQL veritabanı önceki bilgisayarda kaldı. Bu, test kullanıcılarının ve eski içeriklerin silindiği anlamına gelir.
- **Aksiyon:** Bu risk, `dev-seed-workflow-qa.ts` scripti ile ortadan kaldırılabilir. Bu script çalıştırıldığında test ortamı için gereken tüm roller (Owner, Admin, Designer, Client) ve demo şirketler yeniden oluşturulacaktır.

## 3. Playwright E2E Testleri ve Dil Çatışması 🧪
- Kısa özet dokümanlarında belirtildiğine göre Playwright testleri son seanslarda Türkçe'ye uyarlandı. Ancak arayüz tarafındaki UI metinlerinin tam olarak çevrilip çevrilmediği veya testlerin bu yeni ortamda direkt stabil çalışıp çalışmayacağı bir belirsizlik barındırıyor.
- **Aksiyon:** Ortam kurulduktan sonra E2E testlerinin (headless modda) çalıştırılarak sonuçlarının analiz edilmesi gerekiyor.

## 4. Hardcoded Değerler / Port Çakışmaları 🔌
- Frontend portu olarak Next.js varsayılan 3000'i kullanır, ancak package.json'da `next dev --port 5173` komutu mevcut. Bu Vite standardı bir porttur. Bu tip bir özel konfigürasyon, API'nin veya CORS ayarlarının bozulmasına yol açabilir.
- **Risk:** `CORS_ORIGINS` içinde `http://localhost:5173` yazılı. Eğer projeyi yanlışlıkla `npm run start` diyerek farklı bir portta (örn. 3000) ayağa kaldırırsak, CORS hataları başlayacaktır.
- **Aksiyon:** Local setup rehberinde belirtilen spesifik komutlara kesinlikle uyulmalıdır.

## 5. Medya Yükleme Servisi (MinIO) Durumu 📦
- Projenin `docker-compose.yml` dosyasında MinIO bulunuyor. Önceki bilgisayarda bu MinIO konteynerinin içi doldurulmuş olabilir. Şu an boş olacağı için eski test veritabanını bir şekilde kursak bile imaj linkleri `404 Not Found` hatası verecektir.
- **Aksiyon:** Yeni baştan taze veri setleri (seed) kullanılacağı için eski resimlerin kaybı tolere edilebilir durumdadır.

## 6. Tarayıcı (Browser) Bağımlılıkları 🌐
- Yeni bilgisayarda Chromium / Playwright tarayıcı motorları yüklü değil.
- **Aksiyon:** Playwright testleri çalıştırılmadan önce `npx playwright install` komutunun manuel olarak çalıştırılması gerekecek. Aksi halde test komutları doğrudan çöker.
