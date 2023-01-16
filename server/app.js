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
const whitelist = [
  "https://venu-frontend.onrender.com",
  "https://venu-frontend.onrender.com/me",
  "https://venu-frontend.onrender.com/me/editProfile",
  "https://venu-frontend.onrender.com/signupLogin",
  "https://venu-frontend.onrender.com/signupLogin",
  "https://venu-frontend.onrender.com/artists",
  "https://venu-frontend.onrender.com/artists/profile/*",
  "https://venu-frontend.onrender.com/artists/resetPassword/*",
  "https://venu-frontend.onrender.com/artists/reactivateAccount/*",
  "https://venu-frontend.onrender.com/artists/confirmDate/*",
  "https://venu-frontend.onrender.com/artists/login",
  "https://venu-frontend.onrender.com/artists/signup",
  "https://venu-frontend.onrender.com/venues",
  "https://venu-frontend.onrender.com/venues/profile/*",
  "https://venu-frontend.onrender.com/venues/resetPassword/*",
  "https://venu-frontend.onrender.com/venues/reactivateAccount/*",
  "https://venu-frontend.onrender.com/venues/confirmDate/*",
  "https://venu-frontend.onrender.com/venues/login",
  "https://venu-frontend.onrender.com/venues/signup",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
// Enable pre-flight
app.options("*", cors());
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
// app.use("/admins", adminRouter);

// CREATING 404
app.all("*", (req, res, next) => {
  next(
    new AppError(`Cannot find ${req.originalUrl} on this server!`, 404)
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
