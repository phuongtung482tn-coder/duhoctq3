import { useEffect, useState } from "react";

import { useSiteConfig } from "@/lib/use-site-config";

function pick<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

/** Thông báo "khách vừa đăng ký" trượt lên góc màn hình — dữ liệu & vị trí lấy từ Admin. */
export function RecentLeadPopup() {
  const { config } = useSiteConfig();
  const fomo = config.fomo;
  const [item, setItem] = useState<{ name: string; city: string; mins: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fomo.enabled || fomo.names.length === 0) return;

    let hideTimer: number | undefined;
    let nextTimer: number | undefined;

    const displayMs = Math.max(1, fomo.displaySec) * 1000;
    const minGap = Math.max(1, fomo.minDelaySec) * 1000;
    const maxGap = Math.max(fomo.minDelaySec, fomo.maxDelaySec) * 1000;

    const show = () => {
      const name = pick(fomo.names) ?? "";
      const city = pick(fomo.cities) ?? "";
      setItem({ name, city, mins: 1 + Math.floor(Math.random() * 9) });
      setVisible(true);
      hideTimer = window.setTimeout(() => setVisible(false), displayMs);
      const gap = minGap + Math.random() * (maxGap - minGap);
      nextTimer = window.setTimeout(show, displayMs + gap);
    };

    const first = window.setTimeout(show, minGap);
    return () => {
      window.clearTimeout(first);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (nextTimer) window.clearTimeout(nextTimer);
    };
  }, [fomo.enabled, fomo.names, fomo.cities, fomo.displaySec, fomo.minDelaySec, fomo.maxDelaySec]);

  if (!fomo.enabled || !item) return null;

  const message = fomo.template
    .replaceAll("{name}", item.name)
    .replaceAll("{city}", item.city)
    .replaceAll("{mins}", String(item.mins));

  const side =
    fomo.position === "right"
      ? "right-3 sm:right-6 left-auto"
      : "left-3 sm:left-6 right-auto";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-24 z-40 max-w-[17rem] rounded-2xl bg-card/90 p-3 shadow-[var(--shadow-card)] ring-1 ring-border backdrop-blur transition-all duration-500 sm:bottom-6 ${side} ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <p className="text-xs leading-snug text-card-foreground">{message}</p>
      <p className="mt-1 text-[11px] font-semibold text-primary">{item.mins} phút trước</p>
    </div>
  );
}
