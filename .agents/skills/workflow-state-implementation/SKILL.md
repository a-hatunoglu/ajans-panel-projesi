---
name: workflow-state-implementation
description: Bir kayıdın veya içeriğin yaşam döngüsü boyunca (draft, review, approved, vs.) geçişlerini ve version kontrol süreçlerini hatasız kodlama seti.
---

# Workflow State Implementation Skill

## Goal
Müşteri ve ajans arasındaki iş akış ve onay operasyonlarında; state-machine (örneğin draft -> in_review -> revise -> approved -> scheduled -> published) geçişlerini hatasız kodlamak ve bu geçişlerde versioning (sürüm) ile comment (yorum) mantığını senkron koordine etmek.

## When to use
* Özellik (feature) geliştirirken bir belgenin, içeriğin veya ödemenin yaşam döngüsü (status/state flow) kodlandığında.
* Client'tan revizyon istenirken veya metin 'Yayınlandı' durumuna alınırken Prisma transaction mutasyonları planlandığında.
* Geçmiş versiyonları veya içerik yorumları gibi etkileşimsel audit-log mantıkları inşa edilirken.

## When not to use
* Sabit kayıtların (Company update, User update) basit CRUD operasyonlarında.
* Genel görünüm/stil revizyonlarında veya saf frontend navigasyon düzeltmelerinde (`app-surface-implementation` kullanımalıdır).

## Instructions
1. Sistemin hangi state'ten hangi state'e geçişinin serbest (valid) olduğunu backend controller'ında garantiye alın (Örn: "Draft" olmadan "Published" olamaz).
2. Prisma transaction bloklarını kullanarak statü geçişiyle birlikte comment/versiyon tablolarını eş zamanlı ve atomik olarak doldurun.
3. State değişikliğini tetikleyen TanStack hooks (mutation) işlemlerini optimistic update gibi patternlerle akıcı gösterin.
4. Geri dönüş (revert/revise) işlemlerinde, versiyonlama stratejisinin eskimemesini sağlayın.

## Constraints
* **Öksüz Değer Yasaktır:** `ContentVersions` ve `ContentComments` tabloları arasında kural dışı kopukluk veya hatalı state yansımalarına neden olacak adımlardan kaçının.
* **Manuel Enum Müdahalesi:** Prisma schema'sındaki model `status` kuralı esnetilip hard-coded value'lar ile ilerlenmemelidir. Gerekli yerlerde enum yapısına sadık kalınmalıdır.

## Output
Sadece backend'de değil, UI üzerindeki rozetler (badge), action butonları ve history loglarında durum bildirimlerinin anlık ve transactional senkronlukta olduğu iş akış modülleri.
