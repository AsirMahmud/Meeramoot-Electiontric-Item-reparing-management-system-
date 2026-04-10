import { Router } from "express";
import * as exampleController from "../controllers/example.controller.js";

export const exampleRouter = Router();

exampleRouter.get("/", exampleController.listExamples);
exampleRouter.get("/:id", exampleController.getExample);
exampleRouter.post("/", exampleController.createExample);
