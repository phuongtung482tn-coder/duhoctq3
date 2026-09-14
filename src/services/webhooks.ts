/**
 * MULTI-CHANNEL WEBHOOK & API SYNC HUB
 * Gửi song song một lead tới mọi endpoint đang bật: Make/Zapier, Google Sheets,
 * Telegram Bot, Supabase REST hoặc endpoint tuỳ ý.
 */
import type { SiteConfig, WebhookEndpoint } from "@/config/site-config";

export interface WebhookResult {
  label: string;
  ok: boolean;
  detail?: string;
}

function telegramBody(url: string, payload: Record<string, unknown>) {
  // URL dạng: https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=123
  const text = Object.entries(payload)
    .map(([k, v]) => `${k}: ${String(v ?? "")}`)
    .join("\n");
  const u = new URL(url);
  const chatId = u.searchParams.get("chat_id") || "";
  u.searchParams.delete("chat_id");
  return { endpoint: u.toString(), body: { chat_id: chatId, text, parse_mode: "HTML" } };
}

async function postOne(
  ep: WebhookEndpoint,
  payload: Record<string, unknown>,
  supabase: { url: string; key: string },
): Promise<WebhookResult> {
  try {
    let endpoint = ep.url;
    let body: unknown = payload;
    let headers: Record<string, string> = { "Content-Type": "application/json" };

    if (ep.type === "telegram") {
      const t = telegramBody(ep.url, payload);
      endpoint = t.endpoint;
      body = t.body;
    } else if (ep.type === "supabase" && supabase.url && supabase.key) {
      endpoint = `${supabase.url.replace(/\/$/, "")}/rest/v1/${ep.url.replace(/^\//, "") || "leads"}`;
      headers = {
        ...headers,
        apikey: supabase.key,
        Authorization: `Bearer ${supabase.key}`,
        Prefer: "return=minimal",
      };
      body = [payload];
    }

    const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) return { label: ep.label || ep.type, ok: false, detail: `HTTP ${res.status}` };
    return { label: ep.label || ep.type, ok: true };
  } catch (err) {
    return { label: ep.label || ep.type, ok: false, detail: (err as Error).message };
  }
}

/**
 * Gửi lead đi mọi kênh. Trả về danh sách kết quả; coi là thành công khi
 * có ít nhất một kênh nhận được dữ liệu (hoặc không cấu hình kênh nào).
 */
export async function dispatchLead(
  config: SiteConfig,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; results: WebhookResult[] }> {
  const endpoints: WebhookEndpoint[] = [];

  const primary = config.form.webhookUrl?.trim();
  if (primary && primary.startsWith("http") && !primary.includes("REPLACE")) {
    endpoints.push({
      id: "primary",
      label: "Webhook chính",
      url: primary,
      enabled: true,
      type: "make",
    });
  }
  endpoints.push(...config.webhooks.filter((w) => w.enabled && w.url.trim()));

  if (endpoints.length === 0) return { ok: true, results: [] };

  const results = await Promise.all(
    endpoints.map((ep) =>
      postOne(ep, payload, { url: config.admin.supabaseUrl, key: config.admin.supabaseAnonKey }),
    ),
  );
  return { ok: results.some((r) => r.ok), results };
}
