import express from "express";
import morgan from "morgan";
import cors from "cors";

import venueRouter from "./routes/venueRoutes.js";
import artistRouter from "./routes/artistRoutes.js";



const app = express();

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/venues", venueRouter);
app.use("/artists", artistRouter);


// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
});

export default app;
