import { Router } from "express";
import { authRouter } from "../modules/auth/routes";
import { taskRouter } from "../modules/tasks/routes";
import { searchRouter } from "../modules/search/routes";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../db/client";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/tasks", requireAuth, taskRouter);
router.use("/search", requireAuth, searchRouter);

router.get("/", requireAuth, async (req, res) => {
  const user = req.currentUser!;
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });
  const todos = tasks.filter((t) => t.status === "TODO");
  const anchors = todos.slice(0, 3);

  res.render("dashboard", { user, tasks, anchors });
});

router.get("/plan", requireAuth, async (req, res) => {
  const user = req.currentUser!;
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });
  const todos = tasks.filter((t) => t.status === "TODO");
  const anchors = todos.slice(0, 3);

  res.render("plan/index", { user, todos, anchors });
});

router.get("/focus", requireAuth, async (req, res) => {
  const user = req.currentUser!;
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });
  const todos = tasks.filter((t) => t.status === "TODO");
  const currentTask = todos[0] || null;
  const upNext = todos.slice(1, 5);

  res.render("focus/index", { user, currentTask, upNext });
});
