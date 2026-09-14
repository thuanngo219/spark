import type { ItemType, View } from "@/lib/types";

export function defaultStartDate(view: View, type: ItemType, today: string) {
  return view.type === "today" && type === "task" ? today : "";
}
