const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception 💥, shutting down...');
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose
    .connect(process.env.DATABASE)
    .then((con) => {
        console.log('DB connection successful');
    })
    .catch((err) => {
        console.log(err.message);
        console.log('DB connection failed');
    });

const Port = process.env.PORT || 8000;
const server = app.listen(Port, () =>
    console.log(`Server is running on port ${Port}...`)
);

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection 💥, shutting down...');
    server.close(() => {
        process.exit(1);
    });
});