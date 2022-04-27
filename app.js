const express = require('express');
const app = express();
const morgan = require('morgan');

const userRouter = require('./router/user.routes');
const tourRouter = require('./router/tour.routes');

// 1) Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) Routes
app.use('/app/v1/tours', userRouter);
app.use('/app/v1/tours', tourRouter);

// 4) start Server
const Port = 3000;
app.listen(Port, () => console.log(`Server is running on port ${Port}...`));