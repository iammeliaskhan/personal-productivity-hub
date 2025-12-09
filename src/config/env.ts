import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL", "file:./dev.db"),
  sessionSecret: required("SESSION_SECRET", "dev-secret-session"),
  cookieSecret: required("COOKIE_SECRET", "dev-secret-cookie"),
};
