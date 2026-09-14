/**
 * Conversion tracking helpers.
 *
 * Base code các pixel nằm trong src/routes/__root.tsx (head scripts).
 * TikTok Pixel đã cấu hình sẵn; Facebook/Google chỉ cần điền ID thật.
 */

type AnyFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: AnyFn;
    ttq?: { track: AnyFn; page?: AnyFn; identify?: AnyFn };
    gtag?: AnyFn;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const GOOGLE_ADS_CONVERSION_LABEL = "AW-XXXXXXXXX/XXXXXXXXXXXXXXX";

export function pushDataLayer(event: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

/** Khách bắt đầu tương tác với ô input đầu tiên */
export function trackFormStart() {
  pushDataLayer({ event: "form_start" });
}

/** Chỉ gọi SAU khi dữ liệu đã gửi thành công về Make.com */
export function trackLead(payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  pushDataLayer({ event: "lead_conversion", nganh_hoc: payload?.["content_name"] ?? "" });

  try {
    window.fbq?.("track", "Lead", payload);
  } catch (e) {
    console.warn("fbq lead failed", e);
  }

  try {
    window.ttq?.track("CompleteRegistration", payload);
    window.ttq?.track("SubmitForm", payload);
  } catch (e) {
    console.warn("ttq event failed", e);
  }

  try {
    window.gtag?.("event", "conversion", {
      send_to: GOOGLE_ADS_CONVERSION_LABEL,
    });
  } catch (e) {
    console.warn("gtag conversion failed", e);
  }
}
