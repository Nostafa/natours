const AppError = require('../utils/appError');

const CastErrorHandlerDB = (error) => {
    message = `Invalid ${error.path} : ${error.value}`;
    return new AppError(message, 400);
};

const duplicateFieldHandlerDB = (error) => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const validationHandlerDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const tokenErrorHandler = (err) => {
    return new AppError('Invalid token! please login again', 401);
};

const tokenExpiredErrorHandler = (err) => {
    return new AppError('Your token has expired. Please try login again', 401);
};
// ********************************************************
const sendErrorDevelopment = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const SendErrorProduction = (err, res) => {
    //* Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //* Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong',
        });
    }
};

module.exports = (err, req, res, next) => {
    console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDevelopment(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let errorMessage;
        if (err.name === 'CastError') {
            errorMessage = CastErrorHandlerDB(err);
        } else if (err.code === 11000) {
            errorMessage = duplicateFieldHandlerDB(err);
        } else if (err.name == 'ValidationError') {
            errorMessage = validationHandlerDB(err);
        } else if (err.name == 'JsonWebTokenError') {
            errorMessage = tokenErrorHandler(err);
        } else if (err.name == 'TokenExpiredError') {
            errorMessage = tokenExpiredErrorHandler(err);
        }
        SendErrorProduction(errorMessage || err, res);
    }
};