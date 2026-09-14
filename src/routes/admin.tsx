import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";

import { useAdmin } from "@/lib/use-admin";
import { useSiteConfig } from "@/lib/use-site-config";

export const Route = createFileRoute("/admin")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { authed, login } = useAdmin();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(password, config.admin.password)) {
      navigate({ to: "/" });
    } else {
      setError(true);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-6 ring-1 ring-white/10">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold">Đăng nhập quản trị</h1>
          <p className="mt-1 text-xs text-white/50">Funnel Builder — Bảng điều khiển</p>
        </div>

        {authed ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-emerald-400">Đã đăng nhập.</p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="w-full rounded-lg bg-white py-2.5 text-sm font-bold text-neutral-900"
            >
              Vào trang & bật chế độ Admin
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Mật khẩu quản trị"
              autoFocus
              className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
            {error && <p className="text-xs text-red-400">Mật khẩu không đúng.</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-white py-2.5 text-sm font-bold text-neutral-900 transition-opacity hover:opacity-90"
            >
              Đăng nhập
            </button>
            <p className="text-center text-[11px] text-white/40">
              Mật khẩu mặc định có thể đổi trong file <code className="text-white/60">src/config/site-config.ts</code>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
