const COMBINING_DIACRITICS = /[̀-ͯ]/g

/** Convierte un texto en un slug: minúsculas, sin tildes ni símbolos. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
