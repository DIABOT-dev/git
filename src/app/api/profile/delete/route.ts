import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/getUserId";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    // Xóa người dùng khỏi Supabase Auth.
    // Điều này sẽ tự động kích hoạt xóa hồ sơ trong bảng 'profiles'
    // nếu có ràng buộc khóa ngoại 'on delete cascade'.
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId); // Gọi supabaseAdmin như một hàm

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Account deleted successfully", data }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Unexpected error during account deletion:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
