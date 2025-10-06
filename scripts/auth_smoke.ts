/* scripts/auth_smoke.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */

type HttpMethod = "GET" | "POST";
const BASE =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

const PATHS = {
  health: "/api/health",
  protectedPage: "/me", // Đã sửa từ "/app/dashboard" thành "/me"
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    forgot: "/api/auth/forgot",
    reset: "/api/auth/reset",
  },
  api: {
    logWater: "/api/log/water",
  },
};

function logStep(title: string) {
  const line = "==============================";
  console.log(line);
  console.log(title);
  console.log(line);
}

function ensure(cond: unknown, msg: string) {
  if (!cond) {
    throw new Error(msg);
  }
}

function url(path: string) {
  return BASE.replace(/\/+$/, "") + path;
}

async function tryFetch(input: string, init?: RequestInit) {
  try {
    const res = await fetch(input, init);
    return res;
  } catch (err) {
    return new Response(null, { status: 599, statusText: String(err) });
  }
}

async function mustGET(path: string, expect2xx: boolean) {
  const res = await tryFetch(url(path), { method: "GET" });
  if (expect2xx) {
    ensure(res.ok, "GET " + path + " expected 2xx, got " + res.status);
  }
  return res;
}

async function softPOST(path: string, body: any, expect2xx: boolean) {
  const res = await tryFetch(url(path), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (expect2xx) {
    ensure(res.ok, "POST " + path + " expected 2xx, got " + res.status);
  }
  return res;
}

/** Simple cookie jar for Node fetch */
class CookieJar {
  private jar: Record<string, string> = {};
  setFromSetCookie(setCookieHeaders: string[] | null) {
    if (!setCookieHeaders) return;
    for (const sc of setCookieHeaders) {
      // "sb:token=abc; Path=/; HttpOnly; ..." -> key=value trước dấu ;
      const first = sc.split(";")[0] || "";
      const idx = first.indexOf("=");
      if (idx > 0) {
        const k = first.slice(0, idx).trim();
        const v = first.slice(idx + 1).trim();
        this.jar[k] = v;
      }
    }
  }
  header() {
    const pairs: string[] = [];
    for (const k in this.jar) {
      pairs.push(k + "=" + this.jar[k]);
    }
    return pairs.join("; ");
  }
}

async function jarFetch(
  cj: CookieJar,
  path: string,
  method: HttpMethod,
  bodyJson?: any
) {
  const init: RequestInit = { method: method, headers: {} };
  const headers: Record<string, string> = {};
  const cookie = cj.header();
  if (cookie) headers["cookie"] = cookie;
  if (bodyJson !== undefined) {
    headers["content-type"] = "application/json";
    (init as any).body = JSON.stringify(bodyJson);
  }
  init.headers = headers;

  const res = await tryFetch(url(path), init);
  const setCookie = res.headers.getSetCookie?.() ?? []
    ? (res.headers as any).getSetCookie()
    : null;
  // Node 20 fetch có thể dùng raw headers:
  const sc =
    setCookie ||
    (res.headers.has("set-cookie")
      ? [res.headers.get("set-cookie") as string]
      : null);
  if (sc) cj.setFromSetCookie(sc as string[]);

  return res;
}

async function main() {
  logStep("0) Health check");

  // 0) Health
  const health = await mustGET(PATHS.health, false);
  ensure(health.ok || health.status === 200, "Health should be reachable");

  // Tạo dữ liệu test
  const ts = Date.now();
  const email = "qa+" + ts + "@example.com";
  const password = "P@ssw0rd_" + ts;

  // 1) Register (nếu có route)
  logStep("1) Register");
  let haveAuthRoutes = true;
  let res = await softPOST(
    PATHS.auth.register,
    {
      email: email,
      password: password,
      consent_terms: true,
      consent_privacy: true,
    },
    false
  );

  if (res.status === 404) {
    console.log(
      "Register route not found. Will SKIP custom /api/auth/* and use protected checks only."
    );
    haveAuthRoutes = false;
  } else if (res.ok) {
    console.log("Register OK");
  } else {
    // Nếu 4xx/5xx nhưng có route, vẫn cho phép tiếp tục để test login (tùy backend)
    console.log("Register returned status " + res.status + ", continue anyway");
  }

  const jar = new CookieJar();

  // 2) Login (nếu có route)
  if (haveAuthRoutes) {
    logStep("2) Login");
    res = await jarFetch(jar, PATHS.auth.login, "POST", {
      email: email,
      password: password,
    });
    ensure(res.ok, "Login expected 2xx, got " + res.status);
  } else {
    console.log("Skip login because /api/auth/login not found");
  }

  // 3) Visit protected page
  logStep("3) Visit protected page");
  res = await jarFetch(jar, PATHS.protectedPage, "GET");
  if (haveAuthRoutes) {
    // Kỳ vọng 200 (đã có cookie sau login)
    ensure(
      res.ok || res.status === 200,
      "Protected page should be accessible after login"
    );
  } else {
    // Nếu không có login route, có thể bị 302 -> /login hoặc 401
    ensure(
      res.status === 200 || res.status === 302 || res.status === 401,
      "Protected page should respond with 200/302/401"
    );
  }

  // 4) Call protected API: /api/log/water
  logStep("4) Log water");
  res = await jarFetch(jar, PATHS.api.logWater, "POST", { ml: 200 });
  if (haveAuthRoutes) {
    ensure(res.ok, "log water expected 2xx, got " + res.status);
  } else {
    // Không có cookie phiên -> có thể 401 -> chấp nhận
    ensure(
      res.ok || res.status === 401 || res.status === 403 || res.status === 404,
      "log water should be 2xx/401/403/404 depending on backend"
    );
  }

  // 5) Forgot + Reset (nếu có route)
  if (haveAuthRoutes) {
    logStep("5) Forgot password");
    res = await jarFetch(jar, PATHS.auth.forgot, "POST", { email: email });
    ensure(res.ok, "forgot expected 2xx, got " + res.status);

    logStep("5.1) Reset password (dev bypass)");
    const newPwd = password + "_1";
    res = await jarFetch(jar, PATHS.auth.reset, "POST", {
      email: email,
      new_password: newPwd,
      // token giả định cho môi trường dev; backend có thể bỏ qua hoặc chấp nhận token đặc biệt
      dev_bypass: true,
    });
    ensure(
      res.ok || res.status === 404,
      "reset expected 2xx (or 404 if route not implemented), got " + res.status
    );

    if (res.ok) {
      // Login lại với mật khẩu mới
      logStep("5.2) Re-login with new password");
      const jar2 = new CookieJar();
      const res2 = await jarFetch(jar2, PATHS.auth.login, "POST", {
        email: email,
        password: newPwd,
      });
      ensure(res2.ok, "re-login expected 2xx, got " + res2.status);
    }
  } else {
    console.log("Skip forgot/reset because /api/auth/* not found");
  }

  // 6) Logout (nếu có route)
  if (haveAuthRoutes) {
    logStep("6) Logout");
    res = await jarFetch(jar, PATHS.auth.logout, "POST", {});
    ensure(res.ok || res.status === 204, "logout should be 2xx/204");
  } else {
    console.log("Skip logout because /api/auth/logout not found");
  }

  // Kết quả
  logStep("RESULT");
  console.log("AUTH SMOKE: PASS (with soft skips where routes are missing)");
}

main()
  .then(function () {
    process.exit(0);
  })
  .catch(function (err) {
    console.error("AUTH SMOKE: FAIL");
    console.error(String(err && (err as any).stack ? (err as any).stack : err));
    process.exit(1);
  });