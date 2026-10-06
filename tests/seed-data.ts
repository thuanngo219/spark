import { addCalendarDays } from "../src/lib/dates";
import { createUuid } from "../src/lib/ids";
import type { SparkData } from "../src/lib/data-ids";
import type { Project, SparkItem } from "../src/lib/types";

export function seedData(today: string): SparkData {
  const workProjectId = createUuid();
  const personalProjectId = createUuid();
  const sparkProjectId = createUuid();
  const projects: Project[] = [
    { id: workProjectId, name: "Công việc", color: "#44D4CD", isStarred: false, archivedAt: null },
    { id: personalProjectId, name: "Cá nhân", color: "#8951C7", isStarred: false, archivedAt: null },
    { id: sparkProjectId, name: "Spark", color: "#D6A84F", isStarred: false, archivedAt: null },
  ];
  const createdAt = new Date().toISOString();
  const items: SparkItem[] = [
    {
      id: createUuid(),
      type: "task",
      title: "Chốt ba việc quan trọng cho hôm nay",
      description: "Chọn đúng ba việc tạo tác động lớn nhất và chốt thứ tự xử lý trước 9 giờ.",
      startDate: today,
      dueDate: today,
      projectId: workProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: true,
      isUrgent: false,
      createdAt,
    },
    {
      id: createUuid(),
      type: "note",
      title: "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách",
      description: null,
      startDate: today,
      dueDate: today,
      projectId: sparkProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: false,
      isUrgent: false,
      createdAt,
    },
    {
      id: createUuid(),
      type: "task",
      title: "Gửi bản cập nhật cho khách hàng",
      description: null,
      startDate: addCalendarDays(today, -2),
      dueDate: addCalendarDays(today, -1),
      projectId: workProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: false,
      isUrgent: true,
      createdAt,
    },
    {
      id: createUuid(),
      type: "task",
      title: "Đặt lịch khám định kỳ",
      description: null,
      startDate: today,
      dueDate: addCalendarDays(today, 2),
      projectId: personalProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: true,
      isUrgent: false,
      createdAt,
    },
  ];
  return { items, projects };
}


