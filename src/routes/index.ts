import { Router } from "express";
import { authRouter } from "../modules/auth/routes";
import { taskRouter } from "../modules/tasks/routes";
import { searchRouter } from "../modules/search/routes";
import { requireAuth } from "../middleware/auth";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/tasks", requireAuth, taskRouter);
router.use("/search", requireAuth, searchRouter);

router.get("/", requireAuth, (req, res) => {
  res.render("dashboard", { user: req.currentUser });
});
