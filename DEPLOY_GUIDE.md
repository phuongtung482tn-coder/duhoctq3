# Hướng dẫn triển khai (Deploy Guide)

Landing page "Du học nghề Trung Quốc" + hệ thống Admin Funnel Builder.
Dự án dùng **TanStack Start (React + Vite)**. Có 2 cách chạy:

- **A. Vercel (khuyến nghị)** — chạy full SSR + Server Function (email tự động).
- **B. Hosting tĩnh (cPanel / DirectAdmin / VPS Nginx)** — chạy bản build tĩnh; email tự động qua Server Function sẽ không hoạt động (thay bằng webhook).

---

## 0. Yêu cầu

- Node.js 18+ và npm.
- (Tùy chọn) Tài khoản Supabase Cloud nếu muốn dùng chế độ **Database Mode**.
- (Tùy chọn) Khóa Resend `RESEND_API_KEY` nếu muốn gửi email tự động.

Cài dependency và chạy thử local:

```bash
npm install
npm run dev      # xem thử tại http://localhost:3000
npm run build    # tạo bản build production
```

---

## A. Deploy lên Vercel

1. Push code lên GitHub (v0 đã đồng bộ sẵn repo này).
2. Vào Vercel → **New Project** → chọn repo → framework tự nhận **TanStack Start**.
3. Thêm biến môi trường (Project → Settings → Environment Variables):
   - `RESEND_API_KEY` — nếu bật Auto Email.
4. Bấm **Deploy**. Xong.

Ưu điểm: Server Function `sendLeadEmail` chạy được, không lộ API key ra trình duyệt.

---

## B. Deploy bản tĩnh lên cPanel / DirectAdmin / VPS Nginx

> Lưu ý: bản tĩnh **không** chạy được Server Function gửi email.
> Hãy dùng **Webhook Hub** (Make/Zapier/Telegram/Sheets) trong Admin để nhận lead
> và để dịch vụ ngoài gửi email thay thế.

1. Build:
   ```bash
   npm run build
   ```
   Thư mục kết quả nằm ở `dist/` (hoặc `.output/public` tùy cấu hình — kiểm tra log build).

2. **cPanel / DirectAdmin:**
   - Mở **File Manager** → vào `public_html`.
   - Upload toàn bộ nội dung thư mục build.
   - File `public/.htaccess` đã kèm sẵn: ép HTTPS, SPA rewrite, Gzip, cache, security headers.

3. **VPS Nginx:** thêm block sau (thay `root` bằng đường dẫn thật):
   ```nginx
   server {
     listen 80;
     server_name duhoctq.example.com;
     root /var/www/duhoctq;
     index index.html;

     # SPA fallback
     location / {
       try_files $uri $uri/ /index.html;
     }

     # Cache tài nguyên tĩnh
     location ~* \.(css|js|webp|png|jpe?g|svg|woff2)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```
   Sau đó cài SSL bằng `certbot --nginx`.

---

## C. Kết nối Supabase Cloud (Database Mode)

Dùng khi muốn cấu hình & lead đồng bộ nhiều thiết bị thay vì chỉ localStorage.

1. Tạo project tại [supabase.com](https://supabase.com).
2. Trong SQL Editor, tạo bảng:
   ```sql
   create table if not exists site_config (
     id int primary key,
     data jsonb,
     updated_at timestamptz default now()
   );
   create table if not exists leads (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz default now(),
     name text, phone text, email text, city text, major text,
     ai_score int, ai_rank text, utm_source text, variant text
   );
   ```
3. Bật RLS và thêm policy phù hợp (hoặc dùng service role qua webhook server-side).
4. Vào **Admin → ⚙️ Storage Mode**: dán `Supabase URL` + `anon key`, đổi sang **Database**, bấm **Kiểm tra kết nối** rồi **LƯU**.

---

## D. Cloud Cron-job (sao lưu định kỳ)

Admin hỗ trợ lịch backup (`daily` / `weekly` / `off`) trong mục **📂 Cloud Cron & Backup**.
Trên hosting/VPS bạn có thể đặt cron gọi endpoint sao lưu, ví dụ:

```bash
# Sao lưu mỗi ngày lúc 2h sáng
0 2 * * * curl -s https://duhoctq.example.com/api/backup >/dev/null 2>&1
```

Hoặc dùng cron của Supabase / dịch vụ ngoài (cron-job.org, EasyCron) trỏ tới webhook backup.

---

## E. Checklist sau khi deploy

- [ ] Trang chủ mở được qua HTTPS.
- [ ] Gửi thử form → kiểm tra lead xuất hiện trong **Admin → 📋 Quản Lý Lead**.
- [ ] Webhook (Make/Telegram/Sheets) nhận được dữ liệu.
- [ ] Pixel Facebook/TikTok/GA4 bắn sự kiện `PageView` và `Lead`.
- [ ] Đổi mật khẩu & đường dẫn Admin (mục **🔑 Đổi Link Admin**) khỏi giá trị mặc định.
- [ ] Cập nhật `public/sitemap.xml` và `public/robots.txt` theo domain thật.
