import type { Project } from "@/lib/types";

export const SPARK_LOGO_NEGATIVE_SRC = "/brand/spark-logo-negative-v2.svg";

export type SyncStatus = "demo" | "loading" | "syncing" | "synced" | "offline" | "reconnecting" | "error" | "not-configured";
export type CloudUser = { id: string; email: string };

export function projectPillWidth(name: string) {
  return Math.max(32, Math.ceil(30 + name.trim().length * 8));
}

export function orderProjectsForSidebar(projects: Project[]) {
  const positioned = [...projects].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return [
    ...positioned.filter((project) => project.isStarred),
    ...positioned.filter((project) => !project.isStarred),
  ];
}

export function isSyncInProgress(status: SyncStatus) {
  return status === "loading" || status === "syncing" || status === "reconnecting";
}

export function syncStatusTitle(status: SyncStatus) {
  if (status === "synced") return "Đã đồng bộ an toàn";
  if (status === "offline") return "Đang offline";
  if (status === "error") return "Đồng bộ đang gián đoạn";
  if (isSyncInProgress(status)) return "Đang nối và đối soát…";
  return "Bật đồng bộ dữ liệu";
}

export function syncStatusDetail(status: SyncStatus) {
  if (status === "synced") return "Cập nhật trên mọi thiết bị";
  if (status === "offline") return "Thay đổi đang chờ mạng trở lại";
  if (status === "error") return "Đã giữ thay đổi trên thiết bị để thử lại";
  return "Public để xem · riêng tư khi dùng";
}

export function syncStatusShortLabel(status: SyncStatus) {
  if (status === "synced") return "Đã sync";
  if (status === "offline") return "Ngoại tuyến";
  if (status === "error") return "Lỗi sync";
  if (status === "reconnecting") return "Kết nối lại";
  if (status === "loading" || status === "syncing") return "Đang sync";
  return "Local";
}
