import { useEffect } from "react";

import { useSiteConfig } from "@/lib/use-site-config";
import { getVariant, utmSource } from "@/lib/ab";
import { trackVisit } from "@/services/dataAdapter";

/** Chèn một thẻ <script> nội tuyến một lần duy nhất. */
function injectInline(id: string, code: string, target: "head" | "body" = "head") {
  if (!code.trim() || document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.type = "text/javascript";
  s.text = code;
  (target === "head" ? document.head : document.body).appendChild(s);
}

function injectSrc(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function injectRaw(id: string, html: string, target: "head" | "body") {
  if (!html.trim() || document.getElementById(id)) return;
  const holder = document.createElement("div");
  holder.id = id;
  holder.style.display = "none";
  holder.innerHTML = html;
  // Script trong innerHTML không tự chạy — tạo lại để thực thi.
  holder.querySelectorAll("script").forEach((old) => {
    const s = document.createElement("script");
    if (old.src) s.src = old.src;
    else s.text = old.textContent || "";
    document.head.appendChild(s);
    old.remove();
  });
  (target === "head" ? document.head : document.body).appendChild(holder);
}

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Áp dụng cấu hình động lên trang thật: Pixel/GA4/GTM, mã xác thực
 * webmaster, custom scripts, màu & font theme, chia biến thể A/B và
 * ghi nhận lượt truy cập cho Analytics.
 */
export function RuntimeConfig() {
  const { config } = useSiteConfig();
  const t = config.tracking;

  // Pixel & tracking
  useEffect(() => {
    if (t.facebookPixelId) {
      injectInline(
        "fb-pixel",
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${t.facebookPixelId}');${t.events.pageView ? "fbq('track','PageView');" : ""}`,
      );
    }
    if (t.tiktokPixelId) {
      injectInline(
        "tiktok-pixel",
        `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${t.tiktokPixelId}');${t.events.pageView ? "ttq.page();" : ""}}(window,document,'ttq');`,
      );
    }
    if (t.ga4Id) {
      injectSrc("ga4-src", `https://www.googletagmanager.com/gtag/js?id=${t.ga4Id}`);
      injectInline(
        "ga4-init",
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${t.ga4Id}');`,
      );
    }
    if (t.gtmId) {
      injectInline(
        "gtm-init",
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${t.gtmId}');`,
      );
    }
    setMeta("google-site-verification", t.googleVerification);
    injectRaw("custom-head", t.customHead, "head");
    injectRaw("custom-body", t.customBody, "body");
    injectRaw("custom-footer", t.customFooter, "body");
  }, [
    t.facebookPixelId,
    t.tiktokPixelId,
    t.ga4Id,
    t.gtmId,
    t.googleVerification,
    t.customHead,
    t.customBody,
    t.customFooter,
    t.events.pageView,
  ]);

  // Theme động (màu & font)
  useEffect(() => {
    const root = document.documentElement;
    if (config.theme.primary) root.style.setProperty("--primary", config.theme.primary);
    if (config.theme.gold) root.style.setProperty("--gold", config.theme.gold);
    if (config.theme.fontBody)
      root.style.setProperty("--font-sans", `"${config.theme.fontBody}", system-ui, sans-serif`);
  }, [config.theme.primary, config.theme.gold, config.theme.fontBody]);

  // Analytics: ghi nhận 1 lượt truy cập/phiên + gán biến thể A/B
  useEffect(() => {
    try {
      if (sessionStorage.getItem("funnel_visit_counted") === "1") return;
      sessionStorage.setItem("funnel_visit_counted", "1");
    } catch {
      /* ignore */
    }
    const variant = getVariant(config.abTest.enabled, config.abTest.split);
    trackVisit(utmSource(), config.abTest.enabled ? variant : undefined);
  }, [config.abTest.enabled, config.abTest.split]);

  return null;
}
