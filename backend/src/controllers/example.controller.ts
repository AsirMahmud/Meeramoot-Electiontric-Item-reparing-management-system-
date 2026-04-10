import type { Request, Response } from "express";
import { exampleModel } from "../models/example.model.js";
import { exampleItemView, exampleListView } from "../views/example.view.js";

export async function listExamples(_req: Request, res: Response) {
  const rows = await exampleModel.list();
  res.json(exampleListView(rows));
}

export async function getExample(req: Request, res: Response) {
  const row = await exampleModel.getById(req.params.id);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ data: exampleItemView(row) });
}

export async function createExample(req: Request, res: Response) {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  const row = await exampleModel.create({ title });
  res.status(201).json({ data: exampleItemView(row) });
}
