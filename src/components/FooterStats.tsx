import { useEffect, useState } from "react";
import { bumpVisitCounters, detectDevice, getIpSnapshot } from "@/lib/behavior";

/**
 * Widget thống kê traffic realtime ở chân trang.
 * Số người online là chỉ số tương đối (12–38) dao động nhẹ theo thời gian;
 * lượt truy cập ngày/tháng lưu ở localStorage của chính thiết bị.
 */
export function FooterStats() {
  const [online, setOnline] = useState(24);
  const [visits, setVisits] = useState({ today: 0, month: 0 });
  const [device, setDevice] = useState("");
  const [ip, setIp] = useState({ ip: "", city: "", visitsToday: 0 });

  useEffect(() => {
    setVisits(bumpVisitCounters());
    const dev = detectDevice();
    setDevice(`${dev.model} · ${dev.os}`);
    setOnline(12 + Math.floor(Math.random() * 27));

    const drift = window.setInterval(() => {
      setOnline((v) => {
        const next = v + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
        return Math.min(38, Math.max(12, next));
      });
    }, 4000);

    const poll = window.setInterval(() => setIp(getIpSnapshot()), 1500);
    return () => {
      window.clearInterval(drift);
      window.clearInterval(poll);
    };
  }, []);

  const suspicious = ip.visitsToday > 5;

  const items = [
    { icon: "🔴", label: "Đang online", value: `${online} người` },
    { icon: "📅", label: "Truy cập hôm nay", value: visits.today.toLocaleString("vi-VN") },
    { icon: "📆", label: "Truy cập tháng này", value: visits.month.toLocaleString("vi-VN") },
    {
      icon: "⚡",
      label: "Thiết bị của bạn",
      value: device ? `${device}${ip.ip ? ` · IP ${ip.ip}` : ""}` : "Đang nhận diện...",
    },
  ];

  return (
    <aside
      aria-label="Thống kê lưu lượng truy cập"
      className="rounded-2xl bg-card/80 p-4 ring-1 ring-border backdrop-blur"
    >
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-background/70 px-3.5 py-3 ring-1 ring-border/70">
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span aria-hidden="true">{it.icon}</span>
              {it.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-bold text-foreground" title={it.value}>
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
      {suspicious && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm font-bold text-destructive ring-1 ring-destructive/30"
        >
          🛡️ Cảnh báo: Phát hiện lưu lượng cao từ IP này!
        </p>
      )}
    </aside>
  );
}
