// Privacy & Isolation Moat
// - Kiểm tra userId vs profile_id
// - Ghi log audit (chỉ demo)

export function enforcePrivacy(userId: string, recordUserId: string) {
  if (userId !== recordUserId) {
    throw new Error("Privacy violation: cross-user access blocked");
  }
}

export function auditLog(userId: string, action: string) {
  console.log(`[AUDIT] ${new Date().toISOString()} | ${userId} | ${action}`);
}
