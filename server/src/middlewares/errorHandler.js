import { sendError } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`, err.stack);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};
