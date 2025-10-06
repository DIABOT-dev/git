// src/lib/url.ts
/**
 * Trả về base URL (protocol + host) từ request hiện tại.
 * Không bao giờ hardcode port.
 */
export function getBaseUrl(req: Request): string {
  const proto = (req.headers.get("x-forwarded-proto") || "http").split(",")[0].trim();
  const host =
    (req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "localhost").split(",")[0].trim();

  return `${proto}://${host}`;
}
