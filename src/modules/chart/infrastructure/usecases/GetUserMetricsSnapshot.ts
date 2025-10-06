import { SnapshotVM } from "../../domain/types";

// Lấy snapshot KPI hiện tại (ví dụ hiển thị header nhanh)
export async function GetUserMetricsSnapshot(repo: { fetchSnapshot: () => Promise<SnapshotVM> }): Promise<SnapshotVM> {
  const result = await repo.fetchSnapshot();
  return result;
}
