/**
 * A/B Split Testing — Traffic Splitter.
 * Gán biến thể cho khách lần đầu vào trang và ghi nhớ ở localStorage
 * để lần sau vẫn thấy đúng biến thể đó.
 */
const KEY = "funnel_ab_variant_v1";

export function getVariant(enabled: boolean, splitToB: number): "A" | "B" {
  if (typeof window === "undefined" || !enabled) return "A";
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "A" || saved === "B") return saved;
    const variant = Math.random() * 100 < splitToB ? "B" : "A";
    window.localStorage.setItem(KEY, variant);
    return variant;
  } catch {
    return "A";
  }
}

export function utmSource(): string {
  if (typeof window === "undefined") return "direct";
  const p = new URLSearchParams(window.location.search);
  return p.get("utm_source") || (document.referrer ? "referral" : "direct");
}
