/**
 * ============================================================================
 * SITE CONFIG — Nguồn dữ liệu tĩnh mặc định cho toàn hệ thống Funnel Builder.
 * ----------------------------------------------------------------------------
 * NGƯỜI BIẾT CODE: chỉnh trực tiếp DEFAULT_CONFIG bên dưới rồi deploy.
 * NGƯỜI KHÔNG BIẾT CODE: chỉnh trực quan trong Admin, bấm "LƯU" (localStorage)
 *   hoặc "XUẤT CONFIG" để tải file dán đè vào đây.
 * ============================================================================
 */

export type StorageMode = "local" | "database";

export interface AdminConfig {
  adminPath: string;
  password: string;
  storageMode: StorageMode;
  supabaseUrl: string;
  supabaseAnonKey: string;
  backupEmail: string;
  cronSchedule: string; // "daily" | "weekly" | "off"
}

export interface WebhookEndpoint {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  type: "make" | "telegram" | "sheets" | "supabase" | "custom";
}

export interface TrackingConfig {
  facebookPixelId: string;
  tiktokPixelId: string;
  tiktokAccessToken: string;
  ga4Id: string;
  gtmId: string;
  googleVerification: string;
  customHead: string;
  customBody: string;
  customFooter: string;
  events: {
    pageView: boolean;
    formStart: boolean;
    lead: boolean;
    completeRegistration: boolean;
  };
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  schemaType: string;
}

export interface FomoConfig {
  enabled: boolean;
  names: string[];
  cities: string[];
  minDelaySec: number;
  maxDelaySec: number;
  displaySec: number;
  position: "left" | "right";
  template: string; // supports {name} {city} {mins}
}

export interface CountdownConfig {
  enabled: boolean;
  slotsLeft: number;
  headline: string;
  endMode: "endOfMonth" | "fixed";
  endDate: string; // ISO, used when endMode === "fixed"
}

export interface FloatingContactConfig {
  enabled: boolean;
  hotline: string;
  zalo: string;
  messenger: string;
}

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "tel" | "email" | "select";
  required: boolean;
}

export interface FormConfig {
  headline: string;
  ctaLabel: string;
  webhookUrl: string;
  redirectUrl: string;
  rateLimitCount: number;
  rateLimitWindowMin: number;
  fields: FormField[];
}

export interface AiAdvisorConfig {
  enabled: boolean;
  vipDeviceRegex: string;
  keyRegions: string;
  fastFillThresholdSec: number;
  vipTimeOnPageSec: number;
  vipScrollPercent: number;
}

export interface ThemeConfig {
  primary: string;
  gold: string;
  fontHeading: string;
  fontBody: string;
}

export interface SiteConfig {
  admin: AdminConfig;
  tracking: TrackingConfig;
  seo: SeoConfig;
  theme: ThemeConfig;
  fomo: FomoConfig;
  countdown: CountdownConfig;
  floatingContact: FloatingContactConfig;
  form: FormConfig;
  aiAdvisor: AiAdvisorConfig;
  webhooks: WebhookEndpoint[];
  emailAutomation: {
    enabled: boolean;
    provider: "resend" | "smtp";
    fromEmail: string;
    subject: string;
    body: string; // supports {name} {phone} {city} {ai_score}
  };
  abTest: {
    enabled: boolean;
    split: number; // % to variant B
    variantALabel: string;
    variantBLabel: string;
  };
}

export const DEFAULT_CONFIG: SiteConfig = {
  admin: {
    adminPath: "admin",
    password: "duhoc2026",
    storageMode: "local",
    supabaseUrl: "",
    supabaseAnonKey: "",
    backupEmail: "",
    cronSchedule: "off",
  },
  tracking: {
    facebookPixelId: "",
    tiktokPixelId: "DAILRC3C77U3EDHHCGUG",
    tiktokAccessToken: "",
    ga4Id: "",
    gtmId: "",
    googleVerification: "",
    customHead: "",
    customBody: "",
    customFooter: "",
    events: { pageView: true, formStart: true, lead: true, completeRegistration: true },
  },
  seo: {
    title: "Du học nghề Trung Quốc 2026 — Học bổng miễn phí KTX, cam kết Visa",
    description:
      "Chương trình du học nghề Trung Quốc trọn gói: học bổng miễn 100% KTX, vừa học vừa làm lương 15-25 triệu/tháng, cam kết Visa 100%. Đăng ký tư vấn miễn phí.",
    keywords: "du học nghề trung quốc, học bổng trung quốc, du học vừa học vừa làm",
    ogImage: "/og-image.jpg",
    schemaType: "EducationalOrganization",
  },
  theme: {
    primary: "#c0392b",
    gold: "#d4af37",
    fontHeading: "Be Vietnam Pro",
    fontBody: "Be Vietnam Pro",
  },
  fomo: {
    enabled: true,
    names: [
      "Trần Văn Nam",
      "Nguyễn Thị Hà",
      "Lê Minh Quân",
      "Phạm Thu Trang",
      "Hoàng Văn Dũng",
      "Đỗ Thị Mai",
      "Vũ Đức Anh",
      "Bùi Thanh Tùng",
      "Ngô Thị Lan",
      "Đặng Hữu Phước",
    ],
    cities: [
      "Bình Dương",
      "Hà Nội",
      "Bắc Giang",
      "Nghệ An",
      "Thanh Hóa",
      "Hải Phòng",
      "Đồng Nai",
      "Thái Nguyên",
      "Cần Thơ",
      "Đắk Lắk",
    ],
    minDelaySec: 10,
    maxDelaySec: 18,
    displaySec: 5,
    position: "left",
    template: "{name} ({city}) vừa đăng ký nhận tư vấn",
  },
  countdown: {
    enabled: true,
    slotsLeft: 12,
    headline: "suất học bổng miễn 100% KTX tháng này",
    endMode: "endOfMonth",
    endDate: "",
  },
  floatingContact: {
    enabled: true,
    hotline: "0900000000",
    zalo: "https://zalo.me/0900000000",
    messenger: "",
  },
  form: {
    headline: "Đăng ký nhận tư vấn miễn phí",
    ctaLabel: "ĐĂNG KÝ NGAY",
    webhookUrl: "https://hook.eu2.make.com/REPLACE_WITH_YOUR_WEBHOOK",
    redirectUrl: "",
    rateLimitCount: 3,
    rateLimitWindowMin: 5,
    fields: [
      {
        name: "name",
        label: "Họ và tên",
        placeholder: "Nguyễn Văn A",
        type: "text",
        required: true,
      },
      {
        name: "phone",
        label: "Số điện thoại",
        placeholder: "09xx xxx xxx",
        type: "tel",
        required: true,
      },
      {
        name: "email",
        label: "Email (không bắt buộc)",
        placeholder: "email@example.com",
        type: "email",
        required: false,
      },
      {
        name: "city",
        label: "Tỉnh/Thành phố",
        placeholder: "Chọn tỉnh/thành",
        type: "select",
        required: true,
      },
      {
        name: "major",
        label: "Ngành học quan tâm",
        placeholder: "Chọn ngành",
        type: "select",
        required: true,
      },
    ],
  },
  aiAdvisor: {
    enabled: true,
    vipDeviceRegex: "iPhone (13|14|15|16) Pro|Pro Max|Galaxy S(22|23|24)|Fold|Flip",
    keyRegions: "Nghệ An|Hà Tĩnh|Quảng Bình|Thanh Hóa|Quảng Ninh|Hải Phòng",
    fastFillThresholdSec: 4,
    vipTimeOnPageSec: 80,
    vipScrollPercent: 70,
  },
  webhooks: [],
  emailAutomation: {
    enabled: false,
    provider: "resend",
    fromEmail: "",
    subject: "Cảm ơn {name} đã đăng ký tư vấn du học nghề Trung Quốc",
    body: "Chào {name},\n\nCảm ơn bạn đã để lại thông tin. Đội ngũ tư vấn sẽ liên hệ số {phone} trong thời gian sớm nhất.\n\nTrân trọng.",
  },
  abTest: {
    enabled: false,
    split: 50,
    variantALabel: "Variant A",
    variantBLabel: "Variant B",
  },
};
