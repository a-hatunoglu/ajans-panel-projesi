---
name: review-and-regression-validator
description: Yapılan işleri Repo kuralları, dark-first premium tasarım, yetki güvenliği, schema bütünlüğü ve obvious regresyon açısından denetleyen tam stack gözetmen. İş tamamlandı denilmeden önce, PR/commit öncesi ve kod incelemelerinde tetiklenir.
---

# Review and Regression Validator Skill

## Goal
Yapılan full-stack (UI + API) işleri ve yazılan kodları; `REPO_RULES.md` kuralları, dark-first tasarım dili, role safety (güvenliği), query/mutation operasyon bütünlüğü ve obvious (açık) regresyon olasılıkları açısından sıfır tolerans felsefesiyle denetlemek.

## When to use
* Başlangıçtaki veya sürdürülen planı, uygulanan kod parçasını kapatmadan ve "iş bitti" işaretlemesi yapmadan hemen önce.
* Frontend kodlarında stil sapmaları hissedildiğinde veya generic UX kurallarıyla proje kuralları çakıştığında.
* Migration'lar sonrasında sorgu güvenliğini denetlemek için.
* PR/commit hazırlığında son kontrol olarak.

## When not to use
* Test framework (Playwright, Jest vb.) gibi unit veya e2e test kodu üretim süreçlerinde kullanılmamalıdır.
* Sıfırdan özellik (feature scaffolding) çıkarılırken üretken komut olarak kullanılmaz.

## Doğrulama Komutları

İş tamamlandığında şu komutları çalıştır ve çıktıyı oku:

```bash
# Backend
cd c:\Users\Akif\Desktop\ajans panel projesi
npm run build          # TypeScript compile kontrolü

# Frontend
cd frontend
npm run build          # Next.js build kontrolü
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
```

## Review Checklist

### Type Safety
- [ ] `any` tipi kullanılmış mı? (Yasak)
- [ ] API response'ları typed mı? (`apiClient<T>`)
- [ ] Yeni type tanımları `features/<module>/types.ts` içinde mi?

### Role Safety
- [ ] Yeni endpoint'te `authenticate` middleware var mı?
- [ ] Şirket bazlı endpoint'te `companyAccess` middleware var mı?
- [ ] Frontend'de gizlenen butonun backend'de karşılığı var mı?
- [ ] Prisma query'lerinde `where` filtresi şirket/kullanıcı bazlı mı?

### Query/Cache Tutarlılığı
- [ ] Yeni mutation'ın `onSuccess`'inde ilgili query'ler invalidate ediliyor mu?
- [ ] Query key convention'a uyuluyor mu?
- [ ] Loading → Error → Empty → Data state sırası doğru mu?

### i18n
- [ ] Hard-coded Türkçe/İngilizce string var mı? (Yasak)
- [ ] Yeni key'ler hem `tr.ts` hem `en.ts`'ye eklenmiş mi?

### Dark-First Tasarım Sapma Kontrolü
- [ ] Raw renk kullanılmış mı? (`bg-blue-500` yerine design token)
- [ ] Neon/parlak status rengi var mı? (Muted olmalı)
- [ ] Gereksiz shadow/glow var mı? (Sadece modal/drawer/dropdown)
- [ ] Animasyon 0.25s'den uzun mu? (Dekoratif animation yasak)
- [ ] `space-y-*` veya `space-x-*` kullanılmış mı? (`gap-*` olmalı)

### Responsive
- [ ] Mobile'da tıklanabilir alanlar en az 44x44px mi?
- [ ] Sidebar içeriği mobile'da erişilebilir mi?

## Tasarım Sapma Kırmızı Bayrakları

Şu pattern'ler gördüğünde **acımasızca düzelt**:

| Sapma | Doğru Olan |
|-------|------------|
| `bg-blue-600`, `text-green-400` gibi raw renkler | `bg-zinc-800`, `text-zinc-400`, `text-white` design token'ları |
| `shadow-lg`, `shadow-2xl` app surface'te | `border border-white/5` veya `border-zinc-800` |
| `rounded-2xl`, `rounded-3xl` | `rounded-lg` veya `rounded-xl` maximum |
| Bounce, spring, 1s+ animasyonlar | `duration-200`, `ease-out`, subtle transition |
| Renkli gradient arka planlar | Düz `bg-zinc-950` veya subtle `bg-zinc-900` |
| Widget koleksiyonu / chart spam | Operasyonel fayda odaklı, sadece gereken veri |

## Constraints
* **Yalnızca Frontend Denetimine İndirgeme:** UI butonunun gizliliği ile yetinme, backend logic kontrolünü de mutlak zorunlu tut.
* **Gevşek İyimserlik:** Ajan olarak kibarlaşma. Yazılan veya tasarlanan yapı Repo Rules haricinde ise doğrudan fail ettir!

## Output
Güvensiz, stil dışı olan veya projede regresyona sebep olabilecek yapıların net bir şekilde derlendiği hata listesi raporu veya doğrudan düzeltmeye giden patch'ler.