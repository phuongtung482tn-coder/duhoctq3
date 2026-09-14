/**
 * Micro-Behavioral Analytics + Cyber Fraud Defense.
 *
 * Thu thập hành vi vi mô (thời gian xem, độ cuộn, section tập trung, FAQ,
 * copy/paste, pin, thiết bị, IP, UTM) rồi gộp thành 4 chuỗi dữ liệu gửi
 * kèm payload webhook: sale_advice / behavior_summary / device_tech_info /
 * traffic_ads_source.
 *
 * Toàn bộ chạy phía trình duyệt, không chặn render.
 */

export type BehaviorData = {
  time_on_page_seconds: number;
  time_to_first_interaction_seconds: number;
  form_fill_duration_seconds: number;
  scroll_depth_percent: number;
  industry_switch_count: number;
  focus_section: string;
  faq_clicked: string;
  copied_text_type: string;
  is_copy_paste: boolean;
  is_headless_browser: boolean;
  submission_count_same_ip: number;
  device_model_name: string;
  operating_system: string;
  browser: string;
  connection_type: string;
  start_battery_level: number | null;
  current_battery_level: number | null;
  battery_drain: number;
  client_ip: string;
  location_city: string;
  form_city: string;
  nganh_hoc: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  ttclid: string;
};

const isBrowser = () => typeof window !== "undefined";

const state = {
  started: 0,
  firstInteraction: 0,
  formStart: 0,
  maxScroll: 0,
  industrySwitch: 0,
  faqClicked: "",
  copiedTextType: "",
  isCopyPaste: false,
  startBattery: null as number | null,
  currentBattery: null as number | null,
  ip: "",
  city: "",
  sectionTime: {} as Record<string, number>,
  visible: {} as Record<string, number>,
  initialized: false,
};

/* ---------------- localStorage helpers ---------------- */

const dayKey = () => new Date().toISOString().slice(0, 10);
const monthKey = () => new Date().toISOString().slice(0, 7);

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

/* ---------------- device parsing ---------------- */

export function detectDevice() {
  if (!isBrowser()) return { model: "Unknown", os: "Unknown", browser: "Unknown" };
  const ua = navigator.userAgent;
  let os = "Unknown";
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = /iPad/.test(ua) ? "iPadOS" : "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "Khác";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  if (/FBAN|FBAV/.test(ua)) browser = "Facebook In-App";
  if (/TikTok|BytedanceWebview/i.test(ua)) browser = "TikTok In-App";
  if (/Zalo/i.test(ua)) browser = "Zalo In-App";

  let model = os;
  const android = ua.match(/Android\s[\d.]+;\s([^;)]+)/);
  if (android?.[1]) model = android[1].replace(/Build\/.*/, "").trim();
  else if (/iPhone/.test(ua)) {
    const w = Math.max(screen.width, screen.height);
    const dpr = window.devicePixelRatio || 2;
    if (w >= 932) model = "iPhone Pro Max (15/16)";
    else if (w >= 926) model = "iPhone Pro Max (12/13/14)";
    else if (w >= 896) model = "iPhone XR/11/XS Max";
    else if (w >= 852) model = "iPhone 14/15/16 Pro";
    else if (w >= 844) model = "iPhone 12/13/14";
    else if (w >= 812) model = "iPhone X/XS/11 Pro";
    else model = dpr >= 3 ? "iPhone Plus" : "iPhone SE/8";
  } else if (/iPad/.test(ua)) model = "iPad";
  else if (os === "Windows") model = "PC Windows";
  else if (os === "macOS") model = "Mac";

  return { model, os, browser };
}

export function isHeadless() {
  if (!isBrowser()) return false;
  const nav = navigator as Navigator & { webdriver?: boolean };
  return Boolean(
    nav.webdriver ||
      /HeadlessChrome|Puppeteer|Playwright|PhantomJS/i.test(navigator.userAgent) ||
      (navigator.languages && navigator.languages.length === 0),
  );
}

function connectionType() {
  if (!isBrowser()) return "";
  const c = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return c?.effectiveType ? c.effectiveType.toUpperCase() : "";
}

/* ---------------- UTM ---------------- */

function utm() {
  if (!isBrowser()) return { source: "", medium: "", campaign: "", content: "", ttclid: "" };
  const stored = readJSON<Record<string, string>>("lp_utm", {});
  const p = new URLSearchParams(window.location.search);
  const pick = (k: string) => p.get(k) || stored[k] || "";
  const data = {
    source: pick("utm_source"),
    medium: pick("utm_medium"),
    campaign: pick("utm_campaign"),
    content: pick("utm_content"),
    ttclid: pick("ttclid"),
  };
  if (p.toString()) {
    writeJSON("lp_utm", {
      utm_source: data.source,
      utm_medium: data.medium,
      utm_campaign: data.campaign,
      utm_content: data.content,
      ttclid: data.ttclid,
    });
  }
  return data;
}

/* ---------------- traffic stats (footer widget) ---------------- */

export type TrafficStats = {
  today: number;
  month: number;
  ip: string;
  city: string;
  device: string;
  ipVisitsToday: number;
  suspicious: boolean;
};

export function bumpVisitCounters(): { today: number; month: number } {
  if (!isBrowser()) return { today: 0, month: 0 };
  const d = readJSON<{ key: string; count: number }>("lp_visits_day", { key: dayKey(), count: 0 });
  const m = readJSON<{ key: string; count: number }>("lp_visits_month", {
    key: monthKey(),
    count: 0,
  });
  const today = d.key === dayKey() ? d.count + 1 : 1;
  const month = m.key === monthKey() ? m.count + 1 : 1;
  writeJSON("lp_visits_day", { key: dayKey(), count: today });
  writeJSON("lp_visits_month", { key: monthKey(), count: month });
  return { today, month };
}

function bumpIpVisits(ip: string) {
  if (!ip) return 0;
  const store = readJSON<{ key: string; map: Record<string, number> }>("lp_ip_visits", {
    key: dayKey(),
    map: {},
  });
  const map = store.key === dayKey() ? store.map : {};
  map[ip] = (map[ip] || 0) + 1;
  writeJSON("lp_ip_visits", { key: dayKey(), map });
  return map[ip];
}

export function bumpSubmissionCount(ip: string) {
  if (!isBrowser()) return 1;
  const key = ip || "unknown";
  const store = readJSON<{ key: string; map: Record<string, number> }>("lp_submits", {
    key: dayKey(),
    map: {},
  });
  const map = store.key === dayKey() ? store.map : {};
  map[key] = (map[key] || 0) + 1;
  writeJSON("lp_submits", { key: dayKey(), map });
  return map[key];
}

/* ---------------- init ---------------- */

export function initBehavior() {
  if (!isBrowser() || state.initialized) return () => {};
  state.initialized = true;
  state.started = Date.now();

  const markInteraction = () => {
    if (!state.firstInteraction) state.firstInteraction = Date.now();
  };
  const onScroll = () => {
    markInteraction();
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.round(((window.scrollY || 0) / total) * 100) : 100;
    state.maxScroll = Math.min(100, Math.max(state.maxScroll, pct));
  };
  const events: Array<[string, EventListener]> = [
    ["scroll", onScroll as EventListener],
    ["pointerdown", markInteraction],
    ["keydown", markInteraction],
  ];
  events.forEach(([n, h]) => window.addEventListener(n, h, { passive: true }));
  onScroll();

  // Dwell time per section -> focus_section
  let observer: IntersectionObserver | undefined;
  const tick = window.setInterval(() => {
    Object.keys(state.visible).forEach((name) => {
      if (state.visible[name]) state.sectionTime[name] = (state.sectionTime[name] || 0) + 1;
    });
  }, 1000);
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const name = (en.target as HTMLElement).dataset["section"];
          if (name) state.visible[name] = en.isIntersecting && en.intersectionRatio > 0.4 ? 1 : 0;
        });
      },
      { threshold: [0, 0.4, 0.8] },
    );
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => observer?.observe(el));
  }

  // Battery
  const navBat = navigator as Navigator & {
    getBattery?: () => Promise<{ level: number; addEventListener: (t: string, f: () => void) => void }>;
  };
  navBat.getBattery?.().then((bat) => {
    state.startBattery = Math.round(bat.level * 100);
    state.currentBattery = state.startBattery;
    bat.addEventListener("levelchange", () => {
      state.currentBattery = Math.round(bat.level * 100);
    });
  }).catch(() => {});

  // IP + city (không chặn UI)
  fetch("https://ipwho.is/")
    .then((r) => r.json())
    .then((j: { ip?: string; city?: string; success?: boolean }) => {
      if (j?.ip) {
        state.ip = j.ip;
        state.city = j.city || "";
        bumpIpVisits(j.ip);
      }
    })
    .catch(() => {});

  return () => {
    events.forEach(([n, h]) => window.removeEventListener(n, h));
    window.clearInterval(tick);
    observer?.disconnect();
  };
}

/* ---------------- marks from UI ---------------- */

export const markFormStart = () => {
  if (!state.formStart) state.formStart = Date.now();
  if (!state.firstInteraction) state.firstInteraction = Date.now();
};
export const markIndustrySwitch = () => {
  state.industrySwitch += 1;
};
export const markFaqClick = (slug: string) => {
  state.faqClicked = slug;
};
export const markCopyPaste = (type = "sdt") => {
  state.isCopyPaste = true;
  state.copiedTextType = type;
};
export const markCopiedText = (type: string) => {
  state.copiedTextType = type;
};

export function getIpSnapshot() {
  const store = readJSON<{ key: string; map: Record<string, number> }>("lp_ip_visits", {
    key: dayKey(),
    map: {},
  });
  const visits = store.key === dayKey() && state.ip ? store.map[state.ip] || 0 : 0;
  return { ip: state.ip, city: state.city, visitsToday: visits };
}

/* ---------------- collect ---------------- */

export function collectBehavior(form: { city: string; major: string }): BehaviorData {
  const now = Date.now();
  const dev = detectDevice();
  const u = utm();
  const focus =
    Object.entries(state.sectionTime).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const submissionCount = bumpSubmissionCount(state.ip);

  return {
    time_on_page_seconds: Math.round((now - state.started) / 1000),
    time_to_first_interaction_seconds: state.firstInteraction
      ? Math.round((state.firstInteraction - state.started) / 1000)
      : 0,
    form_fill_duration_seconds: state.formStart ? Math.round((now - state.formStart) / 1000) : 0,
    scroll_depth_percent: state.maxScroll,
    industry_switch_count: Math.max(0, state.industrySwitch - 1),
    focus_section: focus,
    faq_clicked: state.faqClicked,
    copied_text_type: state.copiedTextType,
    is_copy_paste: state.isCopyPaste,
    is_headless_browser: isHeadless(),
    submission_count_same_ip: submissionCount,
    device_model_name: dev.model,
    operating_system: dev.os,
    browser: dev.browser,
    connection_type: connectionType(),
    start_battery_level: state.startBattery,
    current_battery_level: state.currentBattery,
    battery_drain:
      state.startBattery != null && state.currentBattery != null
        ? Math.max(0, state.startBattery - state.currentBattery)
        : 0,
    client_ip: state.ip,
    location_city: state.city,
    form_city: form.city,
    nganh_hoc: form.major,
    utm_source: u.source,
    utm_medium: u.medium,
    utm_campaign: u.campaign,
    utm_content: u.content,
    ttclid: u.ttclid,
  };
}

/* ---------------- 4 chuỗi gộp ---------------- */

/**
 * Chấm điểm & phân hạng lead từ hành vi vi mô + cấu hình AI Advisor.
 * Trả về điểm 0-100 và nhãn phân hạng để lưu Mini-CRM và chèn vào email.
 */
export function scoreLead(
  data: BehaviorData,
  cfg?: { vipDeviceRegex?: string; keyRegions?: string; fastFillThresholdSec?: number; vipTimeOnPageSec?: number; vipScrollPercent?: number },
): { score: number; rank: string } {
  const fastFill = cfg?.fastFillThresholdSec ?? 4;
  const vipTime = cfg?.vipTimeOnPageSec ?? 80;
  const vipScroll = cfg?.vipScrollPercent ?? 70;

  if (data.is_headless_browser || data.form_fill_duration_seconds < fastFill || data.submission_count_same_ip > 1) {
    return { score: 5, rank: "Bot / Ảo" };
  }

  let score = 45;
  const safe = (re?: string) => {
    if (!re) return null;
    try {
      return new RegExp(re, "i");
    } catch {
      return null;
    }
  };
  const vipDevice = safe(cfg?.vipDeviceRegex) ?? /iPhone (13|14|15|16) Pro|Pro Max|Galaxy S(22|23|24|25)|Fold|Flip/i;
  const keyRegion = safe(cfg?.keyRegions) ?? /Nghệ An|Hà Tĩnh|Quảng Bình|Thanh Hóa|Quảng Ninh|Hải Phòng/i;

  if (vipDevice.test(data.device_model_name)) score += 20;
  if (data.time_on_page_seconds >= vipTime) score += 15;
  if (data.scroll_depth_percent >= vipScroll) score += 12;
  if (keyRegion.test(data.form_city)) score += 8;
  if (data.utm_source && data.utm_source !== "Direct") score += 5;
  if (data.focus_section === "luong_thuc_tap" || data.copied_text_type === "chi_phi") score += 5;
  score = Math.max(0, Math.min(100, score));

  const rank = score >= 80 ? "VIP" : score >= 65 ? "Tiềm năng cao" : score >= 50 ? "Tiềm năng" : "Cần nuôi dưỡng";
  return { score, rank };
}

export function generateSaleAdvice(data: BehaviorData): string {
  const advice: string[] = [];
  const isHighEndDevice =
    /iPhone (13|14|15|16) Pro|Pro Max|Galaxy S(22|23|24|25)|Fold|Flip/i.test(data.device_model_name);
  const h = new Date().getHours();
  const isNightTime = h >= 22 || h <= 6;
  const isLocationMismatch = Boolean(
    data.location_city &&
      data.form_city &&
      !data.location_city.toLowerCase().includes(data.form_city.toLowerCase()) &&
      !data.form_city.toLowerCase().includes(data.location_city.toLowerCase()),
  );
  const isKeyRegion = /Nghệ An|Hà Tĩnh|Quảng Bình|Thanh Hóa|Quảng Ninh|Hải Phòng/i.test(
    data.form_city,
  );

  if (data.form_fill_duration_seconds < 4 || data.is_headless_browser) {
    return "🚨 [LEAD ẢO / BOT SPAM] Điền Form quá nhanh (<4s) hoặc dùng trình duyệt giả lập. KHÔNG GỌI, kiểm tra Zalo trước!";
  }
  if (data.submission_count_same_ip > 1) {
    return `🚨 [CẢNH BÁO SPAM IP] IP này đã bấm gửi ${data.submission_count_same_ip} lần trong ngày. Nghi vấn đối thủ phá Ads hoặc trùng thông tin!`;
  }
  if (isLocationMismatch && data.is_copy_paste) {
    return `⚠️ [NGHI VẤN ĐỐI THỦ DÒ GIÁ] Khai ở ${data.form_city} nhưng IP tại ${data.location_city} + Copy/Paste SĐT. Xác minh kỹ, tuyệt đối không gửi báo giá chi tiết sớm!`;
  }

  if (isHighEndDevice && data.time_on_page_seconds >= 80 && data.scroll_depth_percent >= 70) {
    advice.push(
      `💡 [KHÁCH VIP - PHỤ HUYNH TÀI CHÍNH TỐT] Dùng ${data.device_model_name}. Nghiên cứu rất kỹ trang (${data.time_on_page_seconds}s, cuộn ${data.scroll_depth_percent}%).`,
    );
    advice.push(
      `👉 KỊCH BẢN GỌI: "Em chào anh/chị, em thấy mình đang tìm hiểu lộ trình Du học nghề trọn gói cho cháu. Bên em có chương trình cam kết Visa 100% & KTX VIP tiêu chuẩn..."`,
    );
  } else if (data.focus_section === "luong_thuc_tap" || data.copied_text_type === "chi_phi") {
    advice.push(`💡 [KHÁCH QUAN TÂM THU NHẬP / TÀI CHÍNH] Ngâm đọc rất kỹ phần Chi phí & Thực tập.`);
    advice.push(
      `👉 KỊCH BẢN GỌI: "Chào bạn, ngành ${data.nganh_hoc} đang có gói Vừa học vừa làm thực tập hưởng lương 15-25 triệu/tháng giúp tự trang trải 100% học phí..."`,
    );
  } else if (data.faq_clicked === "tieng_trung") {
    advice.push(`💡 [KHÁCH LO RÀO CẢN TIẾNG TRUNG] Thắc mắc điều kiện đầu vào.`);
    advice.push(
      `👉 KỊCH BẢN GỌI: "Bạn yên tâm nếu chưa biết tiếng Trung nhé, bên mình đào tạo siêu tốc từ 0 lên HSK4 tại Việt Nam trước khi xuất cảnh..."`,
    );
  } else if (data.industry_switch_count > 1) {
    advice.push(
      `💡 [KHÁCH PHÂN VÂN NGÀNH HỌC] Đã đổi chọn ngành ${data.industry_switch_count} lần trước khi chốt ngành ${data.nganh_hoc}.`,
    );
    advice.push(
      `👉 KỊCH BẢN GỌI: Đóng vai Hướng nghiệp, phân tích tiềm năng việc làm & mức lương ngành ${data.nganh_hoc} so với các ngành khác.`,
    );
  } else if (data.time_on_page_seconds < 25) {
    advice.push(
      `💡 [KHÁCH XEM LƯỚT VỘI] Dùng ${data.device_model_name}, lướt nhanh ${data.time_on_page_seconds}s.`,
    );
    advice.push(
      `👉 HÀNH ĐỘNG: Kết bạn Zalo gửi trước Video thực tế KTX & Trường học Trung Quốc rồi mới gọi điện tư vấn.`,
    );
  } else {
    advice.push(
      `💡 [KHÁCH TÌM HIỂU CHUẨN] Dùng ${data.device_model_name} tại ${data.location_city || "không rõ"}.`,
    );
    advice.push(
      `👉 KỊCH BẢN GỌI: Khai thác nguyện vọng học ngành ${data.nganh_hoc} và trình độ tiếng Trung hiện tại.`,
    );
  }

  if (data.current_battery_level != null && data.current_battery_level <= 15) {
    advice.push(
      `⚡ (Pin thiết bị sắp hết: ${data.current_battery_level}%. Ưu tiên nhắn Zalo/gọi gấp trước khi máy sập nguồn).`,
    );
  }
  if (data.time_to_first_interaction_seconds > 120) {
    advice.push(
      `🧐 (Khách ngẫm hơn 2 phút mới bắt đầu gõ Form: Cân nhắc rất kỹ, Sale nên tư vấn chuyên sâu).`,
    );
  }
  if (isKeyRegion) {
    advice.push(
      `📌 (Khách ở ${data.form_city} - Tỉnh trọng điểm: Nhắc đến cộng đồng du học sinh đồng hương đông đảo tại trường).`,
    );
  }
  if (isNightTime) {
    advice.push(`🌙 (Đăng ký đêm muộn: Nhắn Zalo chào trước, 8h30 sáng hôm sau mới gọi điện).`);
  }

  return advice.join("\n");
}

export function generateBehaviorSummary(data: BehaviorData): string {
  const summary: string[] = [];
  summary.push(
    `⏱️ Xem web: ${data.time_on_page_seconds}s (Ngẫm ${data.time_to_first_interaction_seconds || 0}s mới điền, Điền mất ${data.form_fill_duration_seconds}s)`,
  );
  summary.push(`📜 Cuộn: ${data.scroll_depth_percent}%`);
  if (data.industry_switch_count > 0) summary.push(`🔄 Đổi ngành: ${data.industry_switch_count} lần`);
  if (data.focus_section) summary.push(`🎯 Tập trung: ${data.focus_section}`);
  if (data.faq_clicked) summary.push(`❓ FAQ xem: ${data.faq_clicked}`);
  if (data.is_copy_paste) summary.push(`📋 Thao tác: Copy-Paste SĐT`);
  return summary.join(" | ");
}

export function generateDeviceTechInfo(data: BehaviorData): string {
  const batteryInfo =
    data.start_battery_level != null
      ? `🔋 Pin: ${data.current_battery_level}% (Giảm ${data.battery_drain}% khi lướt)`
      : "🔋 Pin: N/A";
  return `${data.device_model_name} | ${data.operating_system} | ${batteryInfo} | Mạng: ${data.connection_type || "WiFi/4G"} | IP: ${data.client_ip || "N/A"} (${data.location_city || "Không rõ"}) | Browser: ${data.browser}`;
}

export function generateTrafficAdsSource(data: BehaviorData): string {
  return `Source: ${data.utm_source || "Direct"} | Medium: ${data.utm_medium || "N/A"} | Campaign: ${data.utm_campaign || "N/A"} | Content: ${data.utm_content || "N/A"} | TTCLID: ${data.ttclid || "N/A"}`;
}
