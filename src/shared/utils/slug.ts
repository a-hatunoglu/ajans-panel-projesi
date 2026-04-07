/**
 * Basit slug üretici.
 * Türkçe karakter desteği ile URL-friendly string üretir.
 *
 * Örnek: "Acme Şirketi A.Ş." → "acme-sirketi-as"
 */

const TURKISH_MAP: Record<string, string> = {
  ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I',
  ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U',
};

function transliterate(text: string): string {
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => TURKISH_MAP[char] || char);
}

export function generateSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Alfanumerik olmayan karakterleri kaldır
    .replace(/[\s_]+/g, '-')        // Boşluk ve alt çizgiyi tire yap
    .replace(/-+/g, '-')            // Ardışık tireleri teke indir
    .replace(/^-|-$/g, '');         // Baştaki/sondaki tireleri kaldır
}

export function generateUniqueSlug(text: string, existingSlugs: string[]): string {
  const base = generateSlug(text);
  if (!existingSlugs.includes(base)) return base;

  let counter = 1;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
