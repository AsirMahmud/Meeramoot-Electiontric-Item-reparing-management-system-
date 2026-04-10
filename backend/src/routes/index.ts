import { Router } from "express";
import { APP_DISPLAY_NAME, APP_SLUG } from "../config/app.js";
import { exampleRouter } from "./example.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    app: APP_DISPLAY_NAME,
    slug: APP_SLUG,
  });
});

apiRouter.use("/examples", exampleRouter);
