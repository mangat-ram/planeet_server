import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(cors({ origin: process.env.CORS, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./api/user";

app.use("/api/v1/user", userRouter);

export default app;