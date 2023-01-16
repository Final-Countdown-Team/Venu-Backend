import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoSanitze from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";

import venueRouter from "./routes/venueRoutes.js";
import artistRouter from "./routes/artistRoutes.js";
import confirmedDateRouter from "./routes/confirmedDateRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import AppError from "./utils/appError.js";
import { globalErrorHandler } from "./controllers/errorController.js";

const app = express();

// Limit requests
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
// app.use("/", limiter);

// GLOBAL MIDDLEWARE
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "60000kb" }));
app.use(express.urlencoded({ extended: true, limit: "15000kb" }));
app.use(cookieParser());

// SECURITY
app.use(mongoSanitze());
app.use(xss());

// ROUTES
app.use("/venues", venueRouter);
app.use("/artists", artistRouter);
app.use("/confirmedDates", confirmedDateRouter);
app.use("/admins", adminRouter);

// CREATING 404
app.all("*", (req, res, next) => {
  next(
    new AppError(`Cannot find ${req.originalUrl} on this server!`, 404)
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
