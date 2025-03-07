 import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import tasksRouter from "./routes/tasksRouter.js";
import authRouter from "./routes/authRouter.js";

dotenv.config()

const {DB_HOST, PORT}=process.env;

const app = express();

const allowedOrigins = [
  "http://localhost:3000", 
  "https://28-10-rtk-todo.vercel.app", ]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(cors({origin:"http://localhost:3000", credentials: true}));
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));


app.use("/api/tasks", tasksRouter);
app.use ("/api/users", authRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});





 mongoose.connect(DB_HOST)
 .then(() => {
  app.listen(PORT, () => {
    console.log(`Database connection successful. Use port: ${PORT}`);
  });

 }).catch((err) => {
  console.log(err.message);
  process.exit(1);
 });