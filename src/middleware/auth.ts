import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/client";

declare module "express-session" {
  interface SessionData {
    sessionId?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    currentUser?: { id: number; email: string } | null;
  }
}

export async function attachCurrentUser(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.session.sessionId;
  if (!sessionId) {
    req.currentUser = null;
    res.locals.user = null;
    return next();
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      req.currentUser = null;
      res.locals.user = null;
      return next();
    }
    req.currentUser = { id: session.user.id, email: session.user.email };
    res.locals.user = req.currentUser;
  } catch (err) {
    console.error("Error loading session", err);
    req.currentUser = null;
    res.locals.user = null;
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.redirect("/auth/login");
  }
  next();
}
