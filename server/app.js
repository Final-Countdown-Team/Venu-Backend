import express from "express";
import morgan from "morgan";
import cors from "cors";

import venueRouter from "./routes/venueRoutes.js";

const app = express();

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Welcome to main page" });
});
app.use("/venues", venueRouter);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

export default app;
