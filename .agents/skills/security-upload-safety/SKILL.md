---
name: security-upload-safety
description: Dosya yükleme güvenliği, input sanitization ve XSS koruması kuralları. File upload flow, kullanıcı input'u render eden component veya form submission görevlerinde tetiklenir. S3 presigned URL, MIME validation, CSP header ve injection koruması kapsar.
---

# Security Upload Safety Skill

## Goal
Dosya yükleme akışlarında ve kullanıcı girdi render'ında güvenlik açıklarını önlemek. S3/MinIO file upload, input sanitization, XSS koruması ve CSP header doğrulamasını sistematik hale getirmek.

## When to use
* File upload flow'u geliştirilirken veya güncellenirken.
* Kullanıcı tarafından girilen metin render edilirken (content body, comment, notes).
* Form submission işlemlerinde input validation eklenirken.
* S3/MinIO presigned URL akışı kurulurken.
* Güvenlik audit'i yapılırken.

## When not to use
* Read-only sayfalarda (veri sadece okunuyor, input alınmıyorsa).
* Seed script veya migration script'lerinde.
* Marketing statik sayfalarda.

## File Upload Kuralları

### Allowed MIME Types

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
];
```

### File Size Limits

| Dosya Tipi | Max Boyut |
|------------|-----------|
| Image | 10MB |
| Video | 100MB |
| PDF | 20MB |

### Filename Sanitization

```typescript
// ❌ YANLIŞ — Path traversal riski
const filename = req.file.originalname; // "../../../etc/passwd"

// ✅ DOĞRU — UUID + orijinal uzantı
const ext = path.extname(req.file.originalname).toLowerCase();
const safeFilename = `${uuidv4()}${ext}`;
```

### S3 Presigned URL

```typescript
// Upload: presigned PUT URL oluştur (5 dakika geçerli)
// Download: presigned GET URL oluştur (1 saat geçerli)
// Public URL yerine presigned URL tercih et — erişim kontrolü sağlar
```

### Frontend Doğrulama

```typescript
// Hem frontend HEM backend'de doğrula — frontend UX için, backend güvenlik için
const validateFile = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Desteklenmeyen dosya formatı';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Dosya boyutu çok büyük';
  }
  return null;
};
```

## XSS Koruması

### dangerouslySetInnerHTML Yasağı

```tsx
// ❌ KESİNLİKLE YASAK — XSS açığı
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ DOĞRU — React otomatik escape eder
<p>{userContent}</p>

// ✅ DOĞRU — Zengin metin gerekiyorsa sanitize kütüphanesi
// (DOMPurify veya benzeri — ihtiyaç olursa ekle)
```

### URL Validation

```typescript
// Kullanıcı girdiği URL'leri doğrula
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// ❌ javascript: protocol'ü kabul etme
// ❌ data: URL'leri kabul etme
```

## CSP ve Güvenlik Header'ları

Backend `helmet()` middleware'i temel güvenlik header'larını sağlar:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (production)

**Doğrulama:** Yeni bir dış kaynak (CDN, font, analytics) ekleniyorsa CSP kuralları güncellenmelidir.

## Input Validation Katmanları

```
Kullanıcı Input
     ↓
[1] Frontend form validation (Zod + RHF) — UX
     ↓
[2] Backend Zod schema validation — Güvenlik
     ↓
[3] Prisma type safety — Veri bütünlüğü
     ↓
Database
```

Her üç katman da bağımsız çalışmalıdır. Frontend validation bypass edilebilir — backend validation asla atlanmamalıdır.

## Constraints

* **`dangerouslySetInnerHTML` kesinlikle yasaktır** — İstisna yok.
* **Frontend-only validation yeterli değildir** — Backend Zod schema zorunludur.
* **File type kontrolü uzantı ile yapılmamalı** — MIME type + magic bytes kontrolü.
* **Presigned URL süresi minimumda tutulmalı** — Upload 5dk, download 1h.
* **Kullanıcı input'u log'a yazarken escape edilmeli** — Log injection koruması.
