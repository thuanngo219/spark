"use client";

import type { Project } from "@/lib/types";

export function ProjectSelect({ value, projects, onChange }: { value: string; projects: Project[]; onChange: (value: string) => void }) {
  return (
    <select aria-label="Danh mục" value={value} onChange={event => onChange(event.target.value)}>
      <option value="">Không có danh mục</option>
      {projects.map(project => (
        <option key={project.id} value={project.id} disabled={Boolean(project.archivedAt)}>
          {project.name}{project.archivedAt ? " (đã lưu trữ)" : ""}
        </option>
      ))}
    </select>
  );
}
