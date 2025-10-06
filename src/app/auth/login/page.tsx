"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const qs = useSearchParams();

  const [formData, setFormData] = useState({
    contactType: "email" as "email" | "phone",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ===== AUTO-LOGIN: nếu đã có session thì bỏ qua màn login =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!mounted) return;
      if (session?.user) {
        // có phiên -> vào thẳng (giữ deep link nếu có)
        const redirectTo = qs?.get("redirect") || "/";
        router.replace(redirectTo);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, qs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // ===== Validate cơ bản =====
    const newErrors: Record<string, string> = {};
    if (formData.contactType === "email" && !formData.email) {
      newErrors.email = "Email là bắt buộc";
    }
    if (formData.contactType === "phone" && !formData.phone) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // ===== Chuẩn hoá định danh đăng nhập =====
      const loginEmail =
        formData.contactType === "email"
          ? formData.email.trim().toLowerCase()
          : mapPhoneToAliasEmail(formData.phone);

      if (!loginEmail) {
        throw new Error("Số điện thoại không hợp lệ (yêu cầu dạng 0/84/+84…).");
      }

      // ===== Đăng nhập với Supabase (email + password) =====
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formData.password,
      });
      if (error) throw error;

      // ===== Lấy profile để xác định onboarding =====
      const userId = data.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("prefs")
        .eq("id", userId)
        .single();

      const isOnboarded = profile?.prefs?.onboarded;
      const redirectTo = qs?.get("redirect") || (isOnboarded ? "/" : "/profile/setup");
      router.replace(redirectTo);
    } catch (error: any) {
      console.error("Login error:", error?.message || error);
      setErrors({
        general:
          toFriendlyError(error?.message) ||
          "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "zalo") => {
    // Supabase chưa có Zalo -> placeholder dùng GitHub (giữ nguyên ý tưởng cũ)
    await supabase.auth.signInWithOAuth({
      provider: provider === "google" ? "google" : "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-white">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Chào mừng trở lại</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản DIABOT của bạn</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Contact Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Đăng nhập bằng</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, contactType: "email" }))}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  formData.contactType === "email"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, contactType: "phone" }))}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  formData.contactType === "phone"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Số điện thoại
              </button>
            </div>
          </div>

          {/* Email or Phone Input */}
          {formData.contactType === "email" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="your@email.com"
                autoComplete="username"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="0901234567"
                autoComplete="tel"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Hỗ trợ 0/84/+84. Số sẽ được chuẩn hoá và ánh xạ thành username nội bộ.
              </p>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

            <div className="mt-2 text-right">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary-700">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>
            {/* Zalo placeholder bằng GitHub nếu cần */}
            {/* <button type="button" onClick={() => handleOAuthLogin('zalo')} ...>Đăng nhập với Zalo</button> */}
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary-700 font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= Helpers ================= */

function mapPhoneToAliasEmail(rawPhone: string): string | null {
  const phone = normalizePhoneVN(rawPhone);
  if (!phone) return null;
  return `${phone}@phone.local`; // đồng bộ với register: unique & dễ lookup
}

function normalizePhoneVN(input: string): string | null {
  // Chấp nhận 0xxxxxxxxx | 84xxxxxxxxx | +84xxxxxxxxx (bỏ khoảng trắng/ký tự)
  const cleaned = input.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+84")) {
    const rest = cleaned.slice(3);
    return rest.length >= 8 && rest.length <= 11 ? `+84${rest}` : null;
  }
  if (cleaned.startsWith("84")) {
    const rest = cleaned.slice(2);
    return rest.length >= 8 && rest.length <= 11 ? `+84${rest}` : null;
  }
  if (cleaned.startsWith("0")) {
    const rest = cleaned.slice(1);
    return rest.length >= 8 && rest.length <= 11 ? `+84${rest}` : null;
  }
  return null;
}

function toFriendlyError(message?: string): string | null {
  if (!message) return null;
  const m = `${message}`.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid_grant"))
    return "Sai thông tin đăng nhập. Vui lòng kiểm tra SĐT/Email và mật khẩu.";
  if (m.includes("email not confirmed"))
    return "Email chưa được xác minh. Vui lòng kiểm tra hộp thư để xác nhận.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  return null;
}
