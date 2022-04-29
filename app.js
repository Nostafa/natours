const express = require('express');
const app = express();
const morgan = require('morgan');

const userRouter = require('./router/user.routes');
const tourRouter = require('./router/tour.routes');

// 1) Middleware
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
} else if (process.env.NODE_ENV == 'production') {
    app.use(morgan('tiny'));
}
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;