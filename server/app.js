import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoSanitze from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

import venueRouter from './routes/venueRoutes.js';
import artistRouter from './routes/artistRoutes.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();

// Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/', limiter);

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1000kb' }));
app.use(express.urlencoded({ extended: true, limit: '1000kb' }));
app.use(cookieParser());

// SECURITY
app.use(mongoSanitze());
app.use(xss());

// ROUTES
app.use('/venues', venueRouter);
app.use('/artists', artistRouter);
app.use('/admins', adminRouter);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
});

export default app;
