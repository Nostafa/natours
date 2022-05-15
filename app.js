const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// Middleware Error Handling
const globalErrorHandler = require('./controllers/errorControllers');
const AppError = require('./utils/appError');

// Middlewares Routes
const userRouter = require('./router/user.routes');
const tourRouter = require('./router/tour.routes');
const reviewRouter = require('./router/review.routes');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// 1) Middleware

// Set security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
} else if (process.env.NODE_ENV == 'production') {
    app.use(morgan('tiny'));
}
// set limit request for the same API
const limiter = rateLimit({
    max: 500,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/review', reviewRouter);
app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
app.use((req, res, next) => {
    console.log(req.headers.authorization);
    next();
});

module.exports = app;