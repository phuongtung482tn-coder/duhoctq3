/**
 * HYBRID STORAGE ADAPTER
 * ----------------------
 * - LOCAL MODE (mặc định): đọc/ghi cấu hình qua localStorage, không cần DB.
 * - DATABASE MODE: đồng bộ qua Supabase REST (khi Admin cấu hình URL + anon key).
 *
 * Toàn bộ hệ thống chỉ gọi qua adapter này nên có thể đổi backend mà không sửa UI.
 */
import { DEFAULT_CONFIG, type SiteConfig } from "@/config/site-config";

const CONFIG_KEY = "funnel_site_config_v1";
const LEADS_KEY = "funnel_leads_v1";
const ANALYTICS_KEY = "funnel_analytics_v1";
const BACKUP_KEY = "funnel_backup_snapshots_v1";

/** Deep-merge dữ liệu đã lưu lên mặc định để config luôn đủ trường khi nâng cấp. */
function mergeConfig(base: SiteConfig, override: Partial<SiteConfig> | null): SiteConfig {
  if (!override) return structuredClone(base);
  const out = structuredClone(base) as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(override)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object") {
      out[k] = { ...(out[k] as object), ...(v as object) };
    } else {
      out[k] = v;
    }
  }
  return out as unknown as SiteConfig;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadConfig(): SiteConfig {
  if (!isBrowser()) return structuredClone(DEFAULT_CONFIG);
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    return mergeConfig(DEFAULT_CONFIG, raw ? (JSON.parse(raw) as Partial<SiteConfig>) : null);
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(config: SiteConfig): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  // Auto backup snapshot (giữ tối đa 10 bản gần nhất)
  try {
    const snaps = JSON.parse(window.localStorage.getItem(BACKUP_KEY) || "[]") as unknown[];
    snaps.unshift({ at: new Date().toISOString(), config });
    window.localStorage.setItem(BACKUP_KEY, JSON.stringify(snaps.slice(0, 10)));
  } catch {
    /* ignore */
  }
  // DATABASE MODE: đẩy lên Supabase nếu được cấu hình.
  if (
    config.admin.storageMode === "database" &&
    config.admin.supabaseUrl &&
    config.admin.supabaseAnonKey
  ) {
    void syncConfigToSupabase(config);
  }
}

export function resetConfig(): SiteConfig {
  if (isBrowser()) window.localStorage.removeItem(CONFIG_KEY);
  return structuredClone(DEFAULT_CONFIG);
}

export function exportConfigFile(config: SiteConfig): void {
  if (!isBrowser()) return;
  const content = `// AUTO-GENERATED — dán đè vào src/config/site-config.ts (phần DEFAULT_CONFIG)\nexport const DEFAULT_CONFIG = ${JSON.stringify(
    config,
    null,
    2,
  )};\n`;
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "site-config.export.js";
  a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------- LEADS (Mini-CRM) ---------------------------- */

export interface LeadRecord {
  id: string;
  at: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  major?: string;
  aiScore?: number;
  aiRank?: string;
  utmSource?: string;
  variant?: string;
}

export function loadLeads(): LeadRecord[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(LEADS_KEY) || "[]") as LeadRecord[];
  } catch {
    return [];
  }
}

export function saveLead(lead: LeadRecord): void {
  if (!isBrowser()) return;
  const leads = loadLeads();
  leads.unshift(lead);
  window.localStorage.setItem(LEADS_KEY, JSON.stringify(leads.slice(0, 500)));
}

export function exportLeadsCsv(leads: LeadRecord[]): void {
  if (!isBrowser()) return;
  const headers = [
    "at",
    "name",
    "phone",
    "email",
    "city",
    "major",
    "aiScore",
    "aiRank",
    "utmSource",
    "variant",
  ];
  const rows = leads.map((l) =>
    headers
      .map(
        (h) =>
          `"${String((l as unknown as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`,
      )
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------- ANALYTICS -------------------------------- */

export interface AnalyticsState {
  visits: number;
  leads: number;
  bySource: Record<string, number>;
  byVariant: Record<string, { visits: number; leads: number }>;
}

export function loadAnalytics(): AnalyticsState {
  const empty: AnalyticsState = { visits: 0, leads: 0, bySource: {}, byVariant: {} };
  if (!isBrowser()) return empty;
  try {
    return {
      ...empty,
      ...(JSON.parse(window.localStorage.getItem(ANALYTICS_KEY) || "{}") as AnalyticsState),
    };
  } catch {
    return empty;
  }
}

function saveAnalytics(state: AnalyticsState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(state));
}

export function trackVisit(source: string, variant?: string): void {
  const a = loadAnalytics();
  a.visits += 1;
  a.bySource[source] = (a.bySource[source] || 0) + 1;
  if (variant) {
    a.byVariant[variant] = a.byVariant[variant] || { visits: 0, leads: 0 };
    a.byVariant[variant].visits += 1;
  }
  saveAnalytics(a);
}

export function trackConversion(source: string, variant?: string): void {
  const a = loadAnalytics();
  a.leads += 1;
  a.bySource[source] = a.bySource[source] || 0;
  if (variant) {
    a.byVariant[variant] = a.byVariant[variant] || { visits: 0, leads: 0 };
    a.byVariant[variant].leads += 1;
  }
  saveAnalytics(a);
}

/* ------------------------------- SUPABASE --------------------------------- */

/** Ghi config vào bảng `site_config` (id=1) qua Supabase REST. Best-effort. */
async function syncConfigToSupabase(config: SiteConfig): Promise<void> {
  try {
    const { supabaseUrl, supabaseAnonKey } = config.admin;
    await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/site_config?on_conflict=id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify([{ id: 1, data: config, updated_at: new Date().toISOString() }]),
    });
  } catch (err) {
    console.log("[v0] Supabase sync failed:", (err as Error).message);
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<boolean> {
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.ok || res.status === 404; // 404 = reachable but no root resource
  } catch {
    return false;
  }
}
