const errorHandler = (err, req, res, next) => {
    // Get status code (default to 500 if not set)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode);

    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

// Not found handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
