export const sendSuccess = (res, statusCode, message, data = null) =>
  res.status(statusCode).json({ success: true, statusCode, message, data });

export const sendError = (res, statusCode, message, error = null) =>
  res.status(statusCode).json({ success: false, statusCode, message, error });