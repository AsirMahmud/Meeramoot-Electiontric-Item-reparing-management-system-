import type { Example } from "@prisma/client";

export function exampleListView(rows: Example[]) {
  return { data: rows.map(exampleItemView) };
}

export function exampleItemView(row: Example) {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
