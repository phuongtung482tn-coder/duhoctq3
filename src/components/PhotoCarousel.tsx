import { useEffect, useRef, useState } from "react";

export type Slide = { img: string; caption: string };

/** Carousel ảnh thực tế, tự chạy mượt, có nút chuyển và chấm điều hướng. */
export function PhotoCarousel({ slides, interval = 4000 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!paused.current) setI((p) => (p + 1) % slides.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [slides.length, interval]);

  return (
    <div
      className="overflow-hidden rounded-2xl bg-card ring-1 ring-border"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => (paused.current = false)}
      aria-roledescription="carousel"
    >
      <div className="relative">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {slides.map((s, idx) => (
            <figure key={s.img} className="w-full shrink-0">
              <img
                src={s.img}
                alt={s.caption}
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
              <figcaption className="px-4 py-3 text-center text-sm font-semibold text-card-foreground/85">
                {idx + 1}/{slides.length} — {s.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/3 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-lg font-bold backdrop-blur"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          onClick={() => setI((p) => (p + 1) % slides.length)}
          className="absolute right-2 top-1/3 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-lg font-bold backdrop-blur"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-2 pb-4">
        {slides.map((s, idx) => (
          <button
            key={s.img}
            type="button"
            aria-label={`Xem ảnh ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-6 bg-primary" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
