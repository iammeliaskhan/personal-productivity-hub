import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import { config } from "./config/env";
import { router } from "./routes";
import { attachCurrentUser } from "./middleware/auth";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const expressLayouts = require("express-ejs-layouts");

export const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");

app.use(expressLayouts);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(config.cookieSecret));
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(attachCurrentUser);

app.use("/", router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});
