import mongoSanitize from "express-mongo-sanitize";

// Express 5 makes req.query read-only, so sanitize req.body in place instead
export const sanitizeBody = (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  next();
};
