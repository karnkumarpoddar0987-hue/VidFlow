/**
 * Wraps a controller function and catches Mongoose connection errors,
 * returning a clean 503 instead of an unhandled crash.
 */
const wrapDB = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    // Mongoose "not connected" errors
    if (
      err.name === 'MongoNetworkError' ||
      err.name === 'MongoServerSelectionError' ||
      err.message?.includes('buffering timed out') ||
      err.message?.includes('Client must be connected') ||
      err.message?.includes('connection') ||
      err.message?.includes('ECONNREFUSED')
    ) {
      return res.status(503).json({
        error: 'This feature is temporarily unavailable. Database is offline.',
        code: 'DB_UNAVAILABLE'
      });
    }
    next(err);
  }
};

module.exports = { wrapDB };
