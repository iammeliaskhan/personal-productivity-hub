import { Router } from "express";
import { prisma } from "../../db/client";

export const searchRouter = Router();

searchRouter.get("/", async (req, res) => {
  const q = (req.query.q as string) || "";
  const type = (req.query.type as string) || "all";

  if (!q) {
    return res.render("search/index", { q, type, results: [] });
  }

  const userId = req.currentUser!.id;
  const like = `%${q}%`;

  const [tasks, notes, bookmarks, events] = await Promise.all([
    type === "all" || type === "tasks"
      ? prisma.task.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          },
        })
      : Promise.resolve([]),
    type === "all" || type === "notes"
      ? prisma.note.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q } },
              { content: { contains: q } },
            ],
          },
        })
      : Promise.resolve([]),
    type === "all" || type === "bookmarks"
      ? prisma.bookmark.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { url: { contains: q } },
            ],
          },
        })
      : Promise.resolve([]),
    type === "all" || type === "events"
      ? prisma.event.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          },
        })
      : Promise.resolve([]),
  ]);

  const results = [
    ...tasks.map((t) => ({ kind: "task", item: t })),
    ...notes.map((n) => ({ kind: "note", item: n })),
    ...bookmarks.map((b) => ({ kind: "bookmark", item: b })),
    ...events.map((e) => ({ kind: "event", item: e })),
  ];

  res.render("search/index", { q, type, results });
});
