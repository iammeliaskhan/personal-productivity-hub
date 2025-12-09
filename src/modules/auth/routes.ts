import { Router } from "express";
import { prisma } from "../../db/client";
import { hashPassword, verifyPassword } from "../../utils/password";

export const authRouter = Router();

authRouter.get("/login", (_req, res) => {
  res.render("auth/login");
});

authRouter.get("/signup", (_req, res) => {
  res.render("auth/signup");
});

authRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).send("User already exists");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  req.session.sessionId = session.id;
  res.redirect("/");
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).send("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(400).send("Invalid credentials");
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  req.session.sessionId = session.id;
  res.redirect("/");
});

authRouter.post("/logout", async (req, res) => {
  const sessionId = req.session.sessionId;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});
