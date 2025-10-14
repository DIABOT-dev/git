import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "diabot_sess";
const SESSION_SECRET = process.env.SESSION_SECRET || "PLEASE_SET_32B";

function signSession(data: object) {
  const json = JSON.stringify(data);
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(json).digest("hex");
  return Buffer.from(json).toString("base64") + "." + sig;
}

function verifySession(str: string) {
  const [b64, sig] = str.split(".");
  if (!b64 || !sig) return null;
  const json = Buffer.from(b64, "base64").toString();
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(json).digest("hex");
  if (sig !== expectedSig) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getSession(req: Request): { user_id?: string, profile_id?: string } | null {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  return verifySession(cookie);
}

export function setSession(res: any, session: { user_id: string, profile_id: string }) {
  const value = signSession(session);
  res.cookies.set(SESSION_COOKIE_NAME, value, { httpOnly: true, secure: true, path: "/", maxAge: 7 * 86400 });
}

export function clearSession(res: any) {
  res.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, secure: true, path: "/", maxAge: 0 });
}