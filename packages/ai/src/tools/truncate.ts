export function hardTruncate(text: string, maxChars = 1200): string {
  if (!text) return "";
  return text.length <= maxChars ? text : text.slice(0, maxChars) + "…";
}
