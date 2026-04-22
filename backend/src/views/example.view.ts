<<<<<<< HEAD
type Example = {
=======
/** Placeholder types for example list shaping — no Prisma model named Example in schema. */
export interface ExampleRow {
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
<<<<<<< HEAD
};
=======
}
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba

export function exampleListView(rows: ExampleRow[]) {
  return { data: rows.map(exampleItemView) };
}

export function exampleItemView(row: ExampleRow) {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
