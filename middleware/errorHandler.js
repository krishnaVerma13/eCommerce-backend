import { sendError } from '../utils/apiResponse.js';

export const constants = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

const titles = {
  [constants.VALIDATION_ERROR]: 'Validation Failed',
  [constants.UNAUTHORIZED]: 'Unauthorized',
  [constants.FORBIDDEN]: 'Forbidden',
  [constants.NOT_FOUND]: 'Not Found',
  [constants.CONFLICT]: 'Conflict',
  [constants.SERVER_ERROR]: 'Server Error',
};

const codes = {
  [constants.VALIDATION_ERROR]: 'VALIDATION_ERROR',
  [constants.UNAUTHORIZED]: 'UNAUTHORIZED',
  [constants.FORBIDDEN]: 'FORBIDDEN',
  [constants.NOT_FOUND]: 'NOT_FOUND',
  [constants.CONFLICT]: 'CONFLICT',
  [constants.SERVER_ERROR]: 'SERVER_ERROR',
};

// Works out the status code from the error itself, then from res.statusCode
const resolveStatus = (err, res) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') return constants.VALIDATION_ERROR;
  if (err.type === 'entity.parse.failed') return constants.VALIDATION_ERROR; // bad JSON body
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return constants.UNAUTHORIZED;
  if (err.code === 11000) return constants.CONFLICT; // Mongo duplicate key

  const status = err.statusCode || err.status;
  if (status >= 400) return status;

  // res.statusCode is 200 by default, so treat that as a server error
  return res.statusCode >= 400 ? res.statusCode : constants.SERVER_ERROR;
};

const errorHandler = (err, req, res, next) => {
  // If headers already went out, let Express close the connection
  if (res.headersSent) return next(err);

  const statusCode = resolveStatus(err, res);
  const isServerError = statusCode >= 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (isServerError) console.error(err); // log the real error on the server

  // Don't leak internal messages to the client for 5xx in production
  const message =
    isServerError && isProd
      ? 'Something went wrong. Please try again later.'
      : err.message || titles[statusCode] || 'Error';

  return sendError(res, statusCode, message, {
    code: codes[statusCode] || 'ERROR',
    title: titles[statusCode] || 'Error',
    ...(!isProd && { stackTrace: err.stack }),
  });
};

// Optional: put this before errorHandler to catch unknown routes
export const notFoundHandler = (req, res) =>
  sendError(res, constants.NOT_FOUND, `Route not found: ${req.originalUrl}`, {
    code: 'NOT_FOUND',
    title: titles[constants.NOT_FOUND],
  });

export default errorHandler;