class AppError extends Error {
  constructor(message, statusCode, errCode) {
    super(message);

    this.code = errCode;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
