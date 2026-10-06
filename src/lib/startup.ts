import type { SparkData } from "@/lib/data-ids";
import { addCalendarDays, getLocalDateKey } from "@/lib/dates";

export const EMPTY_SPARK_DATA: SparkData = { projects: [], items: [] };

// Only a complete, untouched legacy seed can be identified safely. User edits,
// partial sets, similarly named entries and cloud snapshots are never removed.
export function removePristineDemoSeed(data: SparkData): SparkData {
  const projectSpecs = [["Công việc", "#44d4cd"], ["Cá nhân", "#8951c7"], ["Spark", "#d6a84f"]];
  const projects = projectSpecs.map(([name, color]) => data.projects.filter(project => project.name === name && project.color.toLowerCase() === color && !project.isStarred && !project.archivedAt));
  if (projects.some(matches => matches.length !== 1)) return data;
  const [work, personal, spark] = projects.map(matches => matches[0]);
  const specs = [
    { title: "Chốt ba việc quan trọng cho hôm nay", type: "task", description: "Chọn đúng ba việc tạo tác động lớn nhất và chốt thứ tự xử lý trước 9 giờ.", projectId: work.id, isImportant: true, isUrgent: false, start: 0, due: 0 },
    { title: "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách", type: "note", description: null, projectId: spark.id, isImportant: false, isUrgent: false, start: 0, due: 0 },
    { title: "Gửi bản cập nhật cho khách hàng", type: "task", description: null, projectId: work.id, isImportant: false, isUrgent: true, start: -2, due: -1 },
    { title: "Đặt lịch khám định kỳ", type: "task", description: null, projectId: personal.id, isImportant: true, isUrgent: false, start: 0, due: 2 },
  ];
  const matches = specs.map(spec => data.items.filter(item => {
    if (!Number.isFinite(Date.parse(item.createdAt))) return false;
    const day = getLocalDateKey(new Date(item.createdAt));
    return item.title === spec.title && item.type === spec.type && item.description === spec.description &&
      !item.descriptionFormat?.some(run => run.bold || run.italic || run.underline || run.softBreak) &&
      item.projectId === spec.projectId && item.isImportant === spec.isImportant && item.isUrgent === spec.isUrgent &&
      !item.completedAt && !item.archivedAt && item.startDate === addCalendarDays(day, spec.start) && item.dueDate === addCalendarDays(day, spec.due);
  }));
  if (matches.some(items => items.length !== 1)) return data;
  const seeded = matches.map(items => items[0]);
  if (new Set(seeded.map(item => item.createdAt)).size !== 1) return data;
  const seedIds = new Set(seeded.map(item => item.id));
  const seedProjectIds = new Set([work.id, personal.id, spark.id]);
  const items = data.items.filter(item => !seedIds.has(item.id));
  const usedProjectIds = new Set(items.map(item => item.projectId));
  return { items, projects: data.projects.filter(project => !seedProjectIds.has(project.id) || usedProjectIds.has(project.id)) };
}

export async function withStartupTimeout<T>(work: Promise<T>, milliseconds = 12_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Startup timed out")), milliseconds);
    })]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
