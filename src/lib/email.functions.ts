/**
 * AUTOMATED EMAIL SEQUENCER (auto-responder).
 * Gửi email cảm ơn ngay sau khi khách đăng ký. Chạy phía server để
 * API key không lộ ra trình duyệt: thêm secret RESEND_API_KEY.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  to: z.string().email(),
  from: z.string().min(3),
  subject: z.string().min(1),
  text: z.string().min(1),
});

export const sendLeadEmail = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) return { sent: false, reason: "missing_api_key" as const };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: data.from,
        to: [data.to],
        subject: data.subject,
        text: data.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`Resend failed [${res.status}]: ${detail}`);
      return { sent: false, reason: "provider_error" as const };
    }
    return { sent: true as const };
  });
