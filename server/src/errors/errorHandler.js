const { AppError } = require("./AppError");

function errorHandler(err, req, res, next) {
    console.error(err);

    let statusCode = 500;
    let message = "Internal server error";

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
}

module.exports = errorHandler;
