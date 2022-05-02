const express = require('express');
const app = express();
const morgan = require('morgan');

// Middleware Error Handling
const globalErrorHandler = require('./controllers/errorControllers');
const AppError = require('./utils/appError');

// Middlewares Routes
const userRouter = require('./router/user.routes');
const tourRouter = require('./router/tour.routes');

// 1) Middleware
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
} else if (process.env.NODE_ENV == 'production') {
    app.use(morgan('tiny'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;