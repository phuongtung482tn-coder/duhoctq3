import { Download, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";

import { useAdmin, type AdminModalKey } from "@/lib/use-admin";
import { useSiteConfig } from "@/lib/use-site-config";
import {
  exportLeadsCsv,
  loadAnalytics,
  loadLeads,
  testSupabaseConnection,
  type AnalyticsState,
  type LeadRecord,
} from "@/services/dataAdapter";
import { AdminModal, Field, Stat, TextArea, TextInput, Toggle } from "./adminUi";

export function AdminModals() {
  const { activeModal, closeModal } = useAdmin();
  if (!activeModal) return null;
  const Body = REGISTRY[activeModal];
  return <Body onClose={closeModal} />;
}

type ModalProps = { onClose: () => void };

/* ------------------------------- FOMO ------------------------------------ */
function FomoModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const f = config.fomo;
  return (
    <AdminModal
      title="Thông Báo FOMO"
      subtitle="Popup 'khách vừa đăng ký' kích thích tâm lý đám đông"
      onClose={onClose}
    >
      <Toggle
        checked={f.enabled}
        onChange={(v) => update((d) => (d.fomo.enabled = v))}
        label="Bật thông báo FOMO"
      />
      <Field label="Mẫu nội dung" hint="Dùng {name}, {city}, {mins}">
        <TextInput
          value={f.template}
          onChange={(e) => update((d) => (d.fomo.template = e.target.value))}
        />
      </Field>
      <Field label="Danh sách tên khách (mỗi dòng 1 tên)">
        <TextArea
          value={f.names.join("\n")}
          onChange={(e) =>
            update((d) => (d.fomo.names = e.target.value.split("\n").filter(Boolean)))
          }
        />
      </Field>
      <Field label="Danh sách tỉnh/thành (mỗi dòng 1 địa danh)">
        <TextArea
          value={f.cities.join("\n")}
          onChange={(e) =>
            update((d) => (d.fomo.cities = e.target.value.split("\n").filter(Boolean)))
          }
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Trễ tối thiểu (s)">
          <TextInput
            type="number"
            value={f.minDelaySec}
            onChange={(e) => update((d) => (d.fomo.minDelaySec = +e.target.value))}
          />
        </Field>
        <Field label="Trễ tối đa (s)">
          <TextInput
            type="number"
            value={f.maxDelaySec}
            onChange={(e) => update((d) => (d.fomo.maxDelaySec = +e.target.value))}
          />
        </Field>
        <Field label="Hiển thị (s)">
          <TextInput
            type="number"
            value={f.displaySec}
            onChange={(e) => update((d) => (d.fomo.displaySec = +e.target.value))}
          />
        </Field>
      </div>
      <Field label="Vị trí">
        <div className="flex gap-2">
          {(["left", "right"] as const).map((p) => (
            <button
              key={p}
              onClick={() => update((d) => (d.fomo.position = p))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                f.position === p
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300"
              }`}
            >
              {p === "left" ? "Góc trái" : "Góc phải"}
            </button>
          ))}
        </div>
      </Field>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------- FORM ------------------------------------ */
function FormModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const form = config.form;
  return (
    <AdminModal
      title="Form & Webhook"
      subtitle="Tùy chỉnh nội dung form và kết nối gửi lead"
      onClose={onClose}
    >
      <Field label="Tiêu đề form">
        <TextInput
          value={form.headline}
          onChange={(e) => update((d) => (d.form.headline = e.target.value))}
        />
      </Field>
      <Field label="Chữ trên nút CTA">
        <TextInput
          value={form.ctaLabel}
          onChange={(e) => update((d) => (d.form.ctaLabel = e.target.value))}
        />
      </Field>
      <Field label="Webhook URL (Make/Zapier)" hint="Giữ nguyên URL đang chạy để không đứt kết nối">
        <TextInput
          value={form.webhookUrl}
          onChange={(e) => update((d) => (d.form.webhookUrl = e.target.value))}
        />
      </Field>
      <Field label="Redirect sau khi gửi (tùy chọn)">
        <TextInput
          value={form.redirectUrl}
          onChange={(e) => update((d) => (d.form.redirectUrl = e.target.value))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Giới hạn số lần gửi">
          <TextInput
            type="number"
            value={form.rateLimitCount}
            onChange={(e) => update((d) => (d.form.rateLimitCount = +e.target.value))}
          />
        </Field>
        <Field label="Trong khoảng (phút)">
          <TextInput
            type="number"
            value={form.rateLimitWindowMin}
            onChange={(e) => update((d) => (d.form.rateLimitWindowMin = +e.target.value))}
          />
        </Field>
      </div>
      <p className="mb-2 text-xs font-semibold text-neutral-700">Nhãn & placeholder các trường</p>
      {form.fields.map((field, i) => (
        <div
          key={field.name}
          className="mb-2 grid grid-cols-2 gap-2 rounded-lg border border-neutral-200 p-2"
        >
          <TextInput
            value={field.label}
            onChange={(e) => update((d) => (d.form.fields[i]!.label = e.target.value))}
            placeholder="Label"
          />
          <TextInput
            value={field.placeholder}
            onChange={(e) => update((d) => (d.form.fields[i]!.placeholder = e.target.value))}
            placeholder="Placeholder"
          />
        </div>
      ))}
      <p className="mt-1 text-[11px] text-neutral-400">
        Dropdown 63 tỉnh/thành (phân theo Miền) và danh sách ngành được giữ nguyên trong form.
      </p>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------ THEME ------------------------------------ */
function ThemeModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const t = config.theme;
  return (
    <AdminModal title="Style & Theme" subtitle="Màu sắc & font hiển thị" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Màu chính (primary)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={t.primary}
              onChange={(e) => update((d) => (d.theme.primary = e.target.value))}
              className="h-9 w-12 rounded border border-neutral-300"
            />
            <TextInput
              value={t.primary}
              onChange={(e) => update((d) => (d.theme.primary = e.target.value))}
            />
          </div>
        </Field>
        <Field label="Màu nhấn (gold)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={t.gold}
              onChange={(e) => update((d) => (d.theme.gold = e.target.value))}
              className="h-9 w-12 rounded border border-neutral-300"
            />
            <TextInput
              value={t.gold}
              onChange={(e) => update((d) => (d.theme.gold = e.target.value))}
            />
          </div>
        </Field>
      </div>
      <Field label="Font tiêu đề">
        <TextInput
          value={t.fontHeading}
          onChange={(e) => update((d) => (d.theme.fontHeading = e.target.value))}
        />
      </Field>
      <Field label="Font nội dung">
        <TextInput
          value={t.fontBody}
          onChange={(e) => update((d) => (d.theme.fontBody = e.target.value))}
        />
      </Field>
      <SaveHint />
    </AdminModal>
  );
}

/* ---------------------------- COUNTDOWN ---------------------------------- */
function CountdownModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const c = config.countdown;
  return (
    <AdminModal
      title="Đồng Hồ Đếm Ngược"
      subtitle="Tạo cảm giác khan hiếm & khẩn cấp"
      onClose={onClose}
    >
      <Toggle
        checked={c.enabled}
        onChange={(v) => update((d) => (d.countdown.enabled = v))}
        label="Bật countdown"
      />
      <Field label="Số suất còn lại">
        <TextInput
          type="number"
          value={c.slotsLeft}
          onChange={(e) => update((d) => (d.countdown.slotsLeft = +e.target.value))}
        />
      </Field>
      <Field label="Dòng chữ mô tả">
        <TextInput
          value={c.headline}
          onChange={(e) => update((d) => (d.countdown.headline = e.target.value))}
        />
      </Field>
      <Field label="Mốc kết thúc">
        <div className="flex gap-2">
          {(["endOfMonth", "fixed"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update((d) => (d.countdown.endMode = m))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                c.endMode === m
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300"
              }`}
            >
              {m === "endOfMonth" ? "Cuối tháng" : "Ngày cố định"}
            </button>
          ))}
        </div>
      </Field>
      {c.endMode === "fixed" && (
        <Field label="Ngày kết thúc">
          <TextInput
            type="datetime-local"
            value={c.endDate}
            onChange={(e) => update((d) => (d.countdown.endDate = e.target.value))}
          />
        </Field>
      )}
      <SaveHint />
    </AdminModal>
  );
}

/* ---------------------------- CONTACT ------------------------------------ */
function ContactModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const c = config.floatingContact;
  return (
    <AdminModal
      title="Hotline & Zalo"
      subtitle="Nút liên hệ nổi + thanh CTA mobile"
      onClose={onClose}
    >
      <Toggle
        checked={c.enabled}
        onChange={(v) => update((d) => (d.floatingContact.enabled = v))}
        label="Bật nút liên hệ nổi"
      />
      <Field label="Số hotline">
        <TextInput
          value={c.hotline}
          onChange={(e) => update((d) => (d.floatingContact.hotline = e.target.value))}
        />
      </Field>
      <Field label="Link Zalo">
        <TextInput
          value={c.zalo}
          onChange={(e) => update((d) => (d.floatingContact.zalo = e.target.value))}
        />
      </Field>
      <Field label="Link Messenger (tùy chọn)">
        <TextInput
          value={c.messenger}
          onChange={(e) => update((d) => (d.floatingContact.messenger = e.target.value))}
        />
      </Field>
      <SaveHint />
    </AdminModal>
  );
}

/* ----------------------------- TRACKING / PIXEL --------------------------- */
function PixelModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const t = config.tracking;
  return (
    <AdminModal title="Pixel & Sự Kiện Ads" subtitle="Facebook, TikTok, GA4, GTM" onClose={onClose}>
      <Field label="Facebook Pixel ID">
        <TextInput
          value={t.facebookPixelId}
          onChange={(e) => update((d) => (d.tracking.facebookPixelId = e.target.value))}
        />
      </Field>
      <Field label="TikTok Pixel ID">
        <TextInput
          value={t.tiktokPixelId}
          onChange={(e) => update((d) => (d.tracking.tiktokPixelId = e.target.value))}
        />
      </Field>
      <Field label="GA4 Measurement ID">
        <TextInput
          value={t.ga4Id}
          onChange={(e) => update((d) => (d.tracking.ga4Id = e.target.value))}
        />
      </Field>
      <Field label="Google Tag Manager ID">
        <TextInput
          value={t.gtmId}
          onChange={(e) => update((d) => (d.tracking.gtmId = e.target.value))}
        />
      </Field>
      <p className="mb-2 text-xs font-semibold text-neutral-700">Bật/tắt sự kiện chuyển đổi</p>
      <Toggle
        checked={t.events.pageView}
        onChange={(v) => update((d) => (d.tracking.events.pageView = v))}
        label="PageView"
      />
      <Toggle
        checked={t.events.formStart}
        onChange={(v) => update((d) => (d.tracking.events.formStart = v))}
        label="Form Start"
      />
      <Toggle
        checked={t.events.lead}
        onChange={(v) => update((d) => (d.tracking.events.lead = v))}
        label="Lead"
      />
      <Toggle
        checked={t.events.completeRegistration}
        onChange={(v) => update((d) => (d.tracking.events.completeRegistration = v))}
        label="CompleteRegistration"
      />
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------- WEBMASTER / SCRIPTS ---------------------------- */
function WebmasterModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const t = config.tracking;
  return (
    <AdminModal
      title="Webmaster & Custom Scripts"
      subtitle="Xác minh Google + chèn mã tùy chỉnh"
      onClose={onClose}
    >
      <Field label="Google Search Console verification">
        <TextInput
          value={t.googleVerification}
          onChange={(e) => update((d) => (d.tracking.googleVerification = e.target.value))}
        />
      </Field>
      <Field label="Custom Script — Head">
        <TextArea
          value={t.customHead}
          onChange={(e) => update((d) => (d.tracking.customHead = e.target.value))}
        />
      </Field>
      <Field label="Custom Script — Body">
        <TextArea
          value={t.customBody}
          onChange={(e) => update((d) => (d.tracking.customBody = e.target.value))}
        />
      </Field>
      <Field label="Custom Script — Footer">
        <TextArea
          value={t.customFooter}
          onChange={(e) => update((d) => (d.tracking.customFooter = e.target.value))}
        />
      </Field>
      <SaveHint />
    </AdminModal>
  );
}

/* -------------------------------- SEO ------------------------------------ */
function SeoModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const s = config.seo;
  return (
    <AdminModal title="SEO Google" subtitle="Meta tags & schema" onClose={onClose}>
      <Field label="Meta Title">
        <TextInput
          value={s.title}
          onChange={(e) => update((d) => (d.seo.title = e.target.value))}
        />
      </Field>
      <Field label="Meta Description">
        <TextArea
          value={s.description}
          onChange={(e) => update((d) => (d.seo.description = e.target.value))}
        />
      </Field>
      <Field label="Keywords">
        <TextInput
          value={s.keywords}
          onChange={(e) => update((d) => (d.seo.keywords = e.target.value))}
        />
      </Field>
      <Field label="OG Image URL">
        <TextInput
          value={s.ogImage}
          onChange={(e) => update((d) => (d.seo.ogImage = e.target.value))}
        />
      </Field>
      <Field label="Schema Type">
        <TextInput
          value={s.schemaType}
          onChange={(e) => update((d) => (d.seo.schemaType = e.target.value))}
        />
      </Field>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------- AI --------------------------------------- */
function AiModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const a = config.aiAdvisor;
  return (
    <AdminModal
      title="AI Sales Advisor"
      subtitle="Ma trận chấm điểm & phân hạng lead"
      onClose={onClose}
    >
      <Toggle
        checked={a.enabled}
        onChange={(v) => update((d) => (d.aiAdvisor.enabled = v))}
        label="Bật gợi ý AI Sales"
      />
      <Field label="Regex nhận diện thiết bị VIP">
        <TextInput
          value={a.vipDeviceRegex}
          onChange={(e) => update((d) => (d.aiAdvisor.vipDeviceRegex = e.target.value))}
        />
      </Field>
      <Field label="Tỉnh trọng điểm (phân tách bằng |)">
        <TextInput
          value={a.keyRegions}
          onChange={(e) => update((d) => (d.aiAdvisor.keyRegions = e.target.value))}
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Điền nhanh (<s) = bot">
          <TextInput
            type="number"
            value={a.fastFillThresholdSec}
            onChange={(e) => update((d) => (d.aiAdvisor.fastFillThresholdSec = +e.target.value))}
          />
        </Field>
        <Field label="VIP: xem web (s)">
          <TextInput
            type="number"
            value={a.vipTimeOnPageSec}
            onChange={(e) => update((d) => (d.aiAdvisor.vipTimeOnPageSec = +e.target.value))}
          />
        </Field>
        <Field label="VIP: cuộn (%)">
          <TextInput
            type="number"
            value={a.vipScrollPercent}
            onChange={(e) => update((d) => (d.aiAdvisor.vipScrollPercent = +e.target.value))}
          />
        </Field>
      </div>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------ EMAIL ------------------------------------- */
function EmailModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const e = config.emailAutomation;
  return (
    <AdminModal
      title="Tự Động Hóa Email"
      subtitle="Gửi email cảm ơn ngay khi có lead"
      onClose={onClose}
    >
      <Toggle
        checked={e.enabled}
        onChange={(v) => update((d) => (d.emailAutomation.enabled = v))}
        label="Bật auto email"
      />
      <Field label="Nhà cung cấp">
        <div className="flex gap-2">
          {(["resend", "smtp"] as const).map((p) => (
            <button
              key={p}
              onClick={() => update((d) => (d.emailAutomation.provider = p))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold uppercase ${
                e.provider === p
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Email gửi đi (From)">
        <TextInput
          value={e.fromEmail}
          onChange={(ev) => update((d) => (d.emailAutomation.fromEmail = ev.target.value))}
        />
      </Field>
      <Field label="Tiêu đề" hint="Dùng {name} {phone} {city} {ai_score}">
        <TextInput
          value={e.subject}
          onChange={(ev) => update((d) => (d.emailAutomation.subject = ev.target.value))}
        />
      </Field>
      <Field label="Nội dung">
        <TextArea
          value={e.body}
          onChange={(ev) => update((d) => (d.emailAutomation.body = ev.target.value))}
        />
      </Field>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------ WEBHOOK HUB ------------------------------- */
function WebhookModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const list = config.webhooks;
  return (
    <AdminModal
      title="Cổng Webhook & Đa Kênh"
      subtitle="Gửi lead tới nhiều nơi cùng lúc"
      onClose={onClose}
    >
      {list.length === 0 && (
        <p className="mb-3 text-xs text-neutral-400">Chưa có endpoint nào. Thêm mới bên dưới.</p>
      )}
      {list.map((w, i) => (
        <div key={w.id} className="mb-2 rounded-lg border border-neutral-200 p-2">
          <div className="mb-2 flex items-center gap-2">
            <TextInput
              value={w.label}
              placeholder="Tên"
              onChange={(e) => update((d) => (d.webhooks[i]!.label = e.target.value))}
            />
            <select
              value={w.type}
              onChange={(e) =>
                update((d) => (d.webhooks[i]!.type = e.target.value as typeof w.type))
              }
              className="rounded-lg border border-neutral-300 px-2 py-2 text-sm"
            >
              <option value="make">Make/Zapier</option>
              <option value="telegram">Telegram</option>
              <option value="sheets">Google Sheets</option>
              <option value="supabase">Supabase</option>
              <option value="custom">Custom</option>
            </select>
            <button
              onClick={() => update((d) => d.webhooks.splice(i, 1))}
              className="rounded-md p-2 text-red-500 hover:bg-red-50"
              aria-label="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <TextInput
            value={w.url}
            placeholder="https://..."
            onChange={(e) => update((d) => (d.webhooks[i]!.url = e.target.value))}
          />
          <div className="mt-2">
            <Toggle
              checked={w.enabled}
              onChange={(v) => update((d) => (d.webhooks[i]!.enabled = v))}
              label="Kích hoạt"
            />
          </div>
        </div>
      ))}
      <button
        onClick={() =>
          update((d) =>
            d.webhooks.push({
              id: `wh_${Date.now()}`,
              label: "Endpoint mới",
              url: "",
              enabled: true,
              type: "make",
            }),
          )
        }
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm font-semibold text-neutral-600"
      >
        <Plus className="h-4 w-4" /> Thêm Webhook
      </button>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------ ANALYTICS --------------------------------- */
function AnalyticsModal({ onClose }: ModalProps) {
  const [a, setA] = useState<AnalyticsState | null>(null);
  useEffect(() => setA(loadAnalytics()), []);
  const cr = a && a.visits > 0 ? ((a.leads / a.visits) * 100).toFixed(1) : "0.0";
  return (
    <AdminModal
      title="Thống Kê & Analytics"
      subtitle="Số liệu thời gian thực (local)"
      onClose={onClose}
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Lượt truy cập" value={a?.visits ?? 0} />
        <Stat label="Lượt đăng ký" value={a?.leads ?? 0} tone="text-emerald-600" />
        <Stat label="Tỷ lệ CR" value={`${cr}%`} tone="text-red-600" />
      </div>
      <p className="mb-2 mt-4 text-xs font-semibold text-neutral-700">Nguồn traffic (UTM)</p>
      <div className="space-y-1">
        {a && Object.keys(a.bySource).length > 0 ? (
          Object.entries(a.bySource).map(([s, n]) => (
            <div
              key={s}
              className="flex justify-between rounded-lg bg-neutral-100 px-3 py-1.5 text-xs dark:bg-white/5"
            >
              <span className="font-medium">{s}</span>
              <span className="tabular-nums">{n}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-neutral-400">Chưa có dữ liệu.</p>
        )}
      </div>
      <p className="mb-2 mt-4 text-xs font-semibold text-neutral-700">So sánh A/B</p>
      {a && Object.keys(a.byVariant).length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(a.byVariant).map(([v, s]) => (
            <div
              key={v}
              className="rounded-lg border border-neutral-200 p-2 text-xs dark:border-white/10"
            >
              <div className="font-bold">{v}</div>
              <div>Visits: {s.visits}</div>
              <div>Leads: {s.leads}</div>
              <div>CR: {s.visits ? ((s.leads / s.visits) * 100).toFixed(1) : "0"}%</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400">A/B test chưa chạy.</p>
      )}
    </AdminModal>
  );
}

/* ------------------------------- LEADS ------------------------------------ */
function LeadsModal({ onClose }: ModalProps) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  useEffect(() => setLeads(loadLeads()), []);
  return (
    <AdminModal
      title="Quản Lý Lead (Mini-CRM)"
      subtitle={`${leads.length} lead đã ghi nhận`}
      onClose={onClose}
    >
      <button
        onClick={() => exportLeadsCsv(leads)}
        disabled={leads.length === 0}
        className="mb-3 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
      >
        <Download className="h-3.5 w-3.5" /> Xuất CSV/Excel
      </button>
      {leads.length === 0 ? (
        <p className="text-xs text-neutral-400">
          Chưa có lead nào. Lead sẽ xuất hiện tại đây sau khi khách gửi form.
        </p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <div
              key={l.id}
              className="rounded-lg border border-neutral-200 p-2.5 text-xs dark:border-white/10"
            >
              <div className="flex justify-between">
                <span className="font-bold">{l.name}</span>
                {l.aiRank && (
                  <span className="rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
                    {l.aiRank}
                  </span>
                )}
              </div>
              <div className="text-neutral-500">
                {l.phone} · {l.city} · {l.major}
              </div>
              <div className="text-[10px] text-neutral-400">
                {new Date(l.at).toLocaleString("vi-VN")} · {l.utmSource || "direct"}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminModal>
  );
}

/* ------------------------------ STORAGE ----------------------------------- */
function StorageModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const a = config.admin;
  const [testing, setTesting] = useState<null | boolean>(null);
  return (
    <AdminModal
      title="Storage Mode"
      subtitle="Local (mặc định) hoặc Supabase Cloud"
      onClose={onClose}
    >
      <Field label="Chế độ lưu trữ">
        <div className="flex gap-2">
          {(["local", "database"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update((d) => (d.admin.storageMode = m))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                a.storageMode === m
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300"
              }`}
            >
              {m === "local" ? "Local (localStorage)" : "Database (Supabase)"}
            </button>
          ))}
        </div>
      </Field>
      {a.storageMode === "database" && (
        <>
          <Field label="Supabase URL">
            <TextInput
              value={a.supabaseUrl}
              onChange={(e) => update((d) => (d.admin.supabaseUrl = e.target.value))}
            />
          </Field>
          <Field label="Supabase Anon Key">
            <TextInput
              value={a.supabaseAnonKey}
              onChange={(e) => update((d) => (d.admin.supabaseAnonKey = e.target.value))}
            />
          </Field>
          <button
            onClick={async () => {
              setTesting(null);
              setTesting(await testSupabaseConnection(a.supabaseUrl, a.supabaseAnonKey));
            }}
            className="mb-3 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-bold text-white"
          >
            Kiểm tra kết nối
          </button>
          {testing !== null && (
            <p className={`text-xs font-semibold ${testing ? "text-emerald-600" : "text-red-600"}`}>
              {testing ? "Kết nối thành công." : "Không kết nối được. Kiểm tra lại URL/Key."}
            </p>
          )}
        </>
      )}
      <SaveHint />
    </AdminModal>
  );
}

/* --------------------------- ADMIN LINK ----------------------------------- */
function AdminLinkModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const a = config.admin;
  return (
    <AdminModal
      title="Đổi Link & Mật Khẩu Admin"
      subtitle="Bảo mật trang quản trị"
      onClose={onClose}
    >
      <Field label="Đường dẫn admin" hint="Truy cập tại /<đường-dẫn>">
        <TextInput
          value={a.adminPath}
          onChange={(e) => update((d) => (d.admin.adminPath = e.target.value))}
        />
      </Field>
      <Field label="Mật khẩu quản trị">
        <TextInput
          value={a.password}
          onChange={(e) => update((d) => (d.admin.password = e.target.value))}
        />
      </Field>
      <p className="text-[11px] text-neutral-400">
        Lưu ý: đây là mật khẩu phía client cho tiện chỉnh sửa nhanh. Với dữ liệu nhạy cảm hãy dùng
        Supabase Row Level Security.
      </p>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------ A/B TEST ---------------------------------- */
function AbTestModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const ab = config.abTest;
  return (
    <AdminModal
      title="A/B Split Testing"
      subtitle="Phân phối traffic giữa 2 biến thể"
      onClose={onClose}
    >
      <Toggle
        checked={ab.enabled}
        onChange={(v) => update((d) => (d.abTest.enabled = v))}
        label="Bật A/B testing"
      />
      <Field label={`% traffic vào Variant B: ${ab.split}%`}>
        <input
          type="range"
          min={0}
          max={100}
          value={ab.split}
          onChange={(e) => update((d) => (d.abTest.split = +e.target.value))}
          className="w-full"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Nhãn Variant A">
          <TextInput
            value={ab.variantALabel}
            onChange={(e) => update((d) => (d.abTest.variantALabel = e.target.value))}
          />
        </Field>
        <Field label="Nhãn Variant B">
          <TextInput
            value={ab.variantBLabel}
            onChange={(e) => update((d) => (d.abTest.variantBLabel = e.target.value))}
          />
        </Field>
      </div>
      <SaveHint />
    </AdminModal>
  );
}

/* ------------------------------- CRON ------------------------------------- */
function CronModal({ onClose }: ModalProps) {
  const { config, update } = useSiteConfig();
  const a = config.admin;
  return (
    <AdminModal
      title="Cloud Cron & Backup"
      subtitle="Gửi backup .json định kỳ qua email"
      onClose={onClose}
    >
      <Field label="Email nhận backup">
        <TextInput
          value={a.backupEmail}
          onChange={(e) => update((d) => (d.admin.backupEmail = e.target.value))}
        />
      </Field>
      <Field label="Lịch chạy">
        <div className="flex gap-2">
          {(["off", "daily", "weekly"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update((d) => (d.admin.cronSchedule = s))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                a.cronSchedule === s
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300"
              }`}
            >
              {s === "off" ? "Tắt" : s === "daily" ? "Hàng ngày" : "Hàng tuần"}
            </button>
          ))}
        </div>
      </Field>
      <p className="text-[11px] text-neutral-400">
        Cron chạy phía Supabase Edge Function / cron-job.org khi ở Database Mode. Ở Local Mode, mỗi
        lần LƯU sẽ tạo snapshot backup tự động (giữ 10 bản gần nhất).
      </p>
      <SaveHint />
    </AdminModal>
  );
}

/* --------------------------- INFO PANELS ---------------------------------- */
function InfoModal({
  onClose,
  title,
  subtitle,
  points,
}: ModalProps & { title: string; subtitle: string; points: string[] }) {
  return (
    <AdminModal title={title} subtitle={subtitle} onClose={onClose}>
      <ul className="space-y-2">
        {points.map((p) => (
          <li
            key={p}
            className="flex gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-700 dark:bg-white/5 dark:text-neutral-200"
          >
            <span className="text-emerald-500">✓</span>
            {p}
          </li>
        ))}
      </ul>
    </AdminModal>
  );
}

function GuideModal({ onClose }: ModalProps) {
  const { config } = useSiteConfig();
  const checks = [
    {
      label: "Webhook đã cấu hình",
      ok: config.form.webhookUrl.includes("http") && !config.form.webhookUrl.includes("REPLACE"),
    },
    { label: "TikTok Pixel", ok: !!config.tracking.tiktokPixelId },
    { label: "SEO title & description", ok: !!config.seo.title && !!config.seo.description },
    { label: "Hotline/Zalo", ok: !!config.floatingContact.hotline },
    {
      label: "Storage mode",
      ok: config.admin.storageMode === "local" || !!config.admin.supabaseUrl,
    },
  ];
  return (
    <AdminModal
      title="Hướng Dẫn & Health Check"
      subtitle="Chẩn đoán nhanh trạng thái hệ thống"
      onClose={onClose}
    >
      <div className="mb-4 space-y-1.5">
        {checks.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-xs dark:border-white/10"
          >
            <span>{c.label}</span>
            <span className={c.ok ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
              {c.ok ? "OK" : "Cần cấu hình"}
            </span>
          </div>
        ))}
      </div>
      <ol className="list-decimal space-y-1.5 pl-5 text-xs text-neutral-600 dark:text-neutral-300">
        <li>Đăng nhập admin, chỉnh sửa các thẻ công cụ trên thanh trên cùng.</li>
        <li>Bấm LƯU để áp dụng (localStorage) hoặc XUẤT CONFIG để tải file dán vào mã nguồn.</li>
        <li>Kết nối Supabase trong Storage Mode để đồng bộ đa thiết bị & lưu lead cloud.</li>
        <li>Kiểm tra form gửi về Make.com và Pixel bắn sự kiện trước khi chạy Ads.</li>
      </ol>
    </AdminModal>
  );
}

/* ----------------------------- REGISTRY ----------------------------------- */
const REGISTRY: Record<AdminModalKey, (p: ModalProps) => ReactElement | null> = {
  editor: (p) => (
    <InfoModal
      {...p}
      title="Sửa Giao Diện"
      subtitle="Chỉnh nội dung landing page"
      points={[
        "Nội dung chính (hero, lợi ích, ngành học) nằm trong src/routes/index.tsx.",
        "Màu sắc & font: dùng thẻ Style & Theme.",
        "Form, CTA, webhook: dùng thẻ Form & Webhook.",
        "Sau khi sửa file nguồn, bấm XUẤT CONFIG để lưu cấu hình đi kèm.",
      ]}
    />
  ),
  fomo: FomoModal,
  analytics: AnalyticsModal,
  pages: (p) => (
    <InfoModal
      {...p}
      title="Quản Lý Đa Trang & Menu"
      subtitle="Trang con, Thank You page, menu điều hướng"
      points={[
        "Trang cảm ơn: đặt Redirect URL trong thẻ Form & Webhook.",
        "Thêm route mới trong src/routes/ (TanStack Router tự nhận).",
        "Menu điều hướng đọc từ cấu hình pageData khi bật Database Mode.",
      ]}
    />
  ),
  abtest: AbTestModal,
  email: EmailModal,
  webhook: WebhookModal,
  sections: (p) => (
    <InfoModal
      {...p}
      title="Thêm Khối Giao Diện"
      subtitle="Thư viện section chuyển đổi cao"
      points={[
        "Các khối có sẵn: Hero, Countdown, Pricing, Grid Icons, Testimonials, FAQ, Video, Guarantee.",
        "Bật/tắt Countdown & Floating Contact bằng thẻ tương ứng.",
        "Thêm section mới bằng cách tạo component trong src/components và chèn vào index.tsx.",
      ]}
    />
  ),
  theme: ThemeModal,
  guide: GuideModal,
  leads: LeadsModal,
  webmaster: WebmasterModal,
  pixel: PixelModal,
  utm: (p) => (
    <InfoModal
      {...p}
      title="UTM Intelligence Hub"
      subtitle="Gắn nhãn nguồn traffic cho AI Sales"
      points={[
        "Thêm ?utm_source=..&utm_medium=..&utm_campaign=.. vào link quảng cáo.",
        "Hệ thống tự đọc UTM, gộp vào biến traffic_ads_source gửi webhook.",
        "AI Sales Advisor dùng nguồn UTM để chọn kịch bản tư vấn phù hợp.",
      ]}
    />
  ),
  cron: CronModal,
  storage: StorageModal,
  seo: SeoModal,
  form: FormModal,
  ai: AiModal,
  contact: ContactModal,
  countdown: CountdownModal,
  adminlink: AdminLinkModal,
  tracking: PixelModal,
  preview: () => null,
};

function SaveHint() {
  const { save, dirty } = useSiteConfig();
  return (
    <div className="sticky bottom-0 -mx-4 mt-4 border-t border-neutral-200 bg-white px-4 pb-1 pt-3 dark:border-white/10 dark:bg-neutral-900">
      <button
        onClick={save}
        className={`w-full rounded-lg py-2.5 text-sm font-bold ${
          dirty ? "bg-emerald-500 text-white" : "bg-neutral-200 text-neutral-500 dark:bg-white/10"
        }`}
      >
        {dirty ? "LƯU THAY ĐỔI" : "Đã lưu"}
      </button>
    </div>
  );
}
