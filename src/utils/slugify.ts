import kebabcase from "lodash.kebabcase";
import slugify from "slugify";


// Check if string contains non-Latin characters

const hasNonLatin = (str: string): boolean => /[^\x00-\x7F]/.test(str);

export const slugifyStr = (str: string): string => {
  if (hasNonLatin(str)) {
    // Preserve non-Latin characters (e.g., Burmese, Chinese, etc.)
    return kebabcase(str);
  }
  // Handle Latin strings with better number/acronym handling
  return slugify(str, { lower: true });
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
