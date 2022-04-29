const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
app.listen(Port, () => console.log(`Server is running on port ${Port}...`));