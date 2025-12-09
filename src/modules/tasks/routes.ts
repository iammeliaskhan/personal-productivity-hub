import { Router } from "express";
import { prisma } from "../../db/client";

export const taskRouter = Router();

taskRouter.get("/", async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.currentUser!.id },
    orderBy: { createdAt: "desc" },
  });
  res.render("tasks/index", { tasks });
});

taskRouter.get("/new", (_req, res) => {
  res.render("tasks/new");
});

taskRouter.post("/", async (req, res) => {
  const { title, description, priority, status, dueDate } = req.body;
  await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: req.currentUser!.id,
    },
  });
  res.redirect("/tasks");
});

taskRouter.get("/:id/edit", async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findFirst({
    where: { id, userId: req.currentUser!.id },
  });
  if (!task) return res.status(404).send("Not found");
  res.render("tasks/edit", { task });
});

taskRouter.post("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, priority, status, dueDate } = req.body;
  await prisma.task.updateMany({
    where: { id, userId: req.currentUser!.id },
    data: {
      title,
      description: description || null,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  res.redirect("/tasks");
});

taskRouter.post("/:id/delete", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.task.deleteMany({ where: { id, userId: req.currentUser!.id } });
  res.redirect("/tasks");
});
