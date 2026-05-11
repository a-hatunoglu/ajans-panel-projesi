# Yerel Ortam Kurulum Rehberi (LOCAL_SETUP_RUNBOOK)

Bu rehber, teknik bilgisi kısıtlı olan bir kullanıcının yeni formatlanmış veya yeni kurulmuş bir bilgisayarda "Ajans Panel" projesini adım adım sorunsuz bir şekilde çalıştırması için hazırlanmıştır.

## 1. Gerekli Programların Kurulumu
Bilgisayarınızda aşağıdaki yazılımların kurulu olduğundan emin olun. Değilse, verilen linklerden kurun:

1. **Node.js:** (Sürüm 20 veya üzeri önerilir). [nodejs.org](https://nodejs.org/) adresinden LTS sürümünü kurun.
2. **Git:** Kaynak kod yönetimi için [git-scm.com](https://git-scm.com/) adresinden indirin.
3. **Docker Desktop:** Veritabanı (PostgreSQL) ve dosya sunucusunu (MinIO) lokalde kolayca çalıştırmak için. [docker.com](https://www.docker.com/products/docker-desktop) adresinden kurun. (Kurulumdan sonra Docker'ın çalıştığından emin olun, sağ alt köşede ikonunu görmelisiniz).
4. **VS Code (Visual Studio Code):** Önerilen kod editörü.

## 2. Çevresel Değişkenlerin (Env) Hazırlanması
Projenin veritabanına ve diğer servislere bağlanabilmesi için şifre ve ayarların olduğu dosyalara ihtiyacı vardır.

### Backend için:
1. Proje ana dizininde (yani `package.json`'ın olduğu ana klasörde) `.env.example` isimli dosyayı bulun.
2. Bu dosyanın bir kopyasını oluşturup adını `.env` yapın. (Kopyala/Yapıştır yapıp ismini değiştirebilirsiniz).
3. `.env` dosyası içinde `DATABASE_URL` satırının `postgresql://ajans_user:ajans_pass_2024@localhost:5432/ajans_panel` şeklinde olduğuna emin olun (Varsayılan hali genellikle doğrudur).

### Frontend için:
1. `frontend` klasörüne girin.
2. Oradaki `.env.example` dosyasının bir kopyasını alıp adını `.env.local` yapın.
3. İçindeki API URL kısmının `http://localhost:3000/api/v1` olduğundan emin olun.

## 3. Servislerin (Docker ile) Başlatılması
Veritabanını başlatmak için projenin ana dizininde (root) bir terminal açın ve şu komutu yazın:

```sh
docker-compose up -d
```
*Bu komut PostgreSQL (veritabanı) ve MinIO (dosya yükleme servisi) sistemlerini arka planda başlatacaktır.*

## 4. Backend'i (Sunucu) Kurma ve Başlatma
Hâlâ ana dizindeki terminalde kalarak sırasıyla şu komutları çalıştırın:

1. **Bağımlılıkları Yükleyin:**
   ```sh
   npm install
   ```

2. **Veritabanı Altyapısını Hazırlayın:**
   ```sh
   npm run prisma:generate
   ```

3. **Veritabanı Tablolarını Oluşturun (Migration):**
   ```sh
   npm run prisma:migrate
   ```

4. **(Opsiyonel ama Önerilen) Örnek Test Verilerini Yükleyin (Seed):**
   Uygulamayı boş görmemek ve hazır kullanıcılarla giriş yapabilmek için:
   ```sh
   npm run dev:seed:workflow-qa
   ```

5. **Backend'i Başlatın:**
   ```sh
   npm run dev
   ```
   *Terminalde uygulamanın 3000 portunda başladığına dair bir mesaj görmelisiniz.*

## 5. Frontend'i (Arayüz) Kurma ve Başlatma
Ayrı, YENİ bir terminal penceresi açın ve `frontend` klasörünün içine girin:

1. **Klasöre Geçiş:**
   ```sh
   cd frontend
   ```

2. **Bağımlılıkları Yükleyin:**
   ```sh
   npm install
   ```

3. **Arayüzü Başlatın:**
   ```sh
   npm run dev
   ```
   *Uygulama arayüzü 5173 portunda ayağa kalkacaktır.*

## 6. Smoke Test (Her Şey Çalışıyor mu Kontrolü)
İki terminal de çalışmaya devam ederken tarayıcınızı açın:

1. **Backend Sağlık Kontrolü:** `http://localhost:3000/api/v1/health` adresine gidin. Ekranda `"success": true` yazan bir metin görüyorsanız backend kusursuz çalışıyor demektir.
2. **Uygulama Girişi:** `http://localhost:5173` adresine gidin. Uygulamanın giriş sayfası veya marketing sayfası açılmalıdır.

### Olası Hata Durumlarında Bakılacak Yerler
- **Docker hataları:** Docker Desktop uygulamasının açık ve çalışır durumda olduğunu kontrol edin.
- **Veritabanı bağlanamıyor hatası:** `.env` dosyanızın doğru oluştuğundan ve `docker-compose up -d` komutunun hata vermediğinden emin olun.
- **Frontend açılmıyor:** `frontend` dizini içindeyken `npm run dev` dediğinize emin olun. Port uyuşmazlığı varsa terminaldeki adrese tıklayın (örn. localhost:5174).
