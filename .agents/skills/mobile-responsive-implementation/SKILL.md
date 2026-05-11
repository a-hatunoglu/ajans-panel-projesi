---
name: mobile-responsive-implementation
description: Desktop-priority ama mobile-usable responsive kuralları. Sayfa layout, component responsive davranışı veya mobile test görevlerinde tetiklenir. Sidebar collapse, table/card dönüşüm, touch target ve breakpoint convention kapsar.
---

# Mobile Responsive Implementation Skill

## Goal
App surface'i desktop-priority ama mobile-usable prensibine göre responsive yapmak. Repo rules'a uygun şekilde mobilde sidebar'lar drawer'a dönüşmeli, tablolar scroll/card view'a geçmeli, touch target'lar yeterli boyutta olmalıdır.

## When to use
* Sayfa layout oluşturulurken veya güncellenirken.
* Component'e responsive davranış eklenirken.
* Mobile test veya responsive audit yapılırken.
* Sidebar, table, calendar gibi karmaşık layout component'leri düzenlenirken.

## When not to use
* Backend-only değişikliklerde.
* Marketing landing surface'te (landing kendi responsive kurallarına sahip — mobile-first).
* Salt desktop performans optimizasyonlarında.

## Breakpoint Convention

Tailwind CSS varsayılan breakpoint'leri kullanılır:

| Breakpoint | Min Width | Kullanım |
|------------|-----------|----------|
| `sm` | 640px | Küçük tablet, büyük telefon |
| `md` | 768px | Tablet |
| `lg` | 1024px | Küçük laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Büyük ekran |

**Tasarım yaklaşımı:** Desktop-first (`lg:` ve üstü tam deneyim, `md` ve altı sadeleşmiş).

## Responsive Dönüşüm Kuralları

### Sidebar → Drawer
Mevcut uygulama: `components/shared/mobile-app-nav.tsx`

- `lg` ve üstü: Sol sidebar (fixed, `w-60`)
- `md` ve altı: Bottom sheet veya hamburger drawer
- Drawer içinde aynı navigasyon linkleri

### Tablo → Scrollable / Card View

```tsx
// Desktop: tam tablo
<div className="hidden lg:block">
  <table>...</table>
</div>

// Mobile: card listesi veya horizontal scroll
<div className="lg:hidden">
  <div className="flex flex-col gap-3">
    {items.map(item => <MobileCard key={item.id} item={item} />)}
  </div>
</div>
```

### Calendar → List/Agenda View
- `lg` ve üstü: Grid takvim (haftalık/aylık)
- `md` ve altı: Tarih sıralı agenda listesi

### Action Buttons
- Desktop: Sayfa üstü sağ köşe
- Mobile: Sticky bottom bar veya FAB

```tsx
// Responsive action bar
<div className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-zinc-950 p-4 lg:static lg:border-none lg:bg-transparent lg:p-0">
  <Button className="w-full lg:w-auto">Kaydet</Button>
</div>
```

## Touch Target Kuralları

- **Minimum boyut:** 44x44px (Apple HIG / WCAG)
- Butonlar: `min-h-[44px] min-w-[44px]`
- Liste item'ları: `py-3` minimum (44px satır yüksekliği)
- Icon-only butonlar: `size-11` (44px)

```tsx
// ✅ DOĞRU — yeterli touch target
<button className="flex h-11 w-11 items-center justify-center rounded-lg">
  <Plus className="h-5 w-5" />
</button>

// ❌ YANLIŞ — çok küçük
<button className="p-1">
  <Plus className="h-4 w-4" />
</button>
```

## Typography Responsive Scaling

```tsx
// Sayfa başlığı
<h1 className="text-xl md:text-2xl font-medium tracking-tight text-white">

// Alt başlık
<p className="text-xs md:text-sm text-zinc-400">

// Gövde metni — mobile'da küçültme gerekli değil
<p className="text-sm text-zinc-300">
```

## Constraints

* **Mobile'da desktop layout kopyalama yasaktır** — Yoğunluk azaltılmalı.
* **Horizontal scroll gizleme yasaktır** — Scroll olacaksa kullanıcıya ipucu verilmeli.
* **Touch target 44px altına düşürülemez** — Tıklanabilir her element.
* **Position fixed dikkatli kullanılmalı** — iOS Safari'de sorun çıkarabilir.
