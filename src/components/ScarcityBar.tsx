import { useEffect, useState } from "react";
import { SLOTS_LEFT } from "@/lib/config";

function nextDeadline() {
  // Hết ngày cuối cùng của tháng hiện tại
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Đếm ngược tới hết tháng + số suất học bổng 0Đ còn lại. */
export function ScarcityBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, nextDeadline() - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const d = left === null ? 0 : Math.floor(left / 86400000);
  const h = left === null ? 0 : Math.floor((left % 86400000) / 3600000);
  const m = left === null ? 0 : Math.floor((left % 3600000) / 60000);
  const s = left === null ? 0 : Math.floor((left % 60000) / 1000);

  const dark = tone === "dark";
  const box = dark
    ? "bg-surface-foreground/10 text-surface-foreground ring-surface-foreground/20"
    : "bg-card text-card-foreground ring-border";
  const accent = dark ? "text-gold" : "text-primary";
  const cell = dark ? "bg-surface-foreground/10" : "bg-primary/10";

  return (
    <div
      className={`rounded-2xl px-4 py-3 ring-1 ${box}`}
      aria-live="polite"
    >
      <p className="text-sm font-bold">
        Chỉ còn{" "}
        <span className={accent}>
          {SLOTS_LEFT.toString().padStart(2, "0")} suất
        </span>{" "}
        học bổng miễn 100% KTX tháng này
      </p>
      <div className="mt-2 flex items-center gap-2">
        {[
          { v: d, l: "Ngày" },
          { v: h, l: "Giờ" },
          { v: m, l: "Phút" },
          { v: s, l: "Giây" },
        ].map((u) => (
          <div
            key={u.l}
            className={`min-w-[3.25rem] rounded-lg px-2 py-1.5 text-center ${cell}`}
          >
            <span className={`block text-lg font-black leading-none tabular-nums ${accent}`}>
              {left === null ? "--" : pad(u.v)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              {u.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
