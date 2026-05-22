import slugify from "slugify";

// Verifica si contiene caracteres fuera del rango ASCII estándar
const hasNonLatin = (str: string): boolean => /[^\x00-\x7F]/.test(str);

export const slugifyStr = (str: string): string => {
  if (hasNonLatin(str)) {
    // Reemplaza espacios y caracteres raros por guiones, simulando kebab-case de forma nativa
    return str
      .toLowerCase()
      .trim()
      .replace(/[\s\W\-_]+/g, "-") // Cambia espacios y símbolos por un solo guión
      .replace(/^-+|-+$/g, "");    // Quita guiones sobrantes al inicio o final
  }
  
  // Para texto normal con alfabeto latino
  return slugify(str, { lower: true, strict: true });
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));