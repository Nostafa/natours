const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../module/tourModule');
const User = require('../module/userModule');
const Review = require('../module/reviewModel');
dotenv.config({ path: '../config.env' });

mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
    })
    .then(() => console.log('connect to database was successful'))
    .catch((err) => console.log(err.message));

// Read JSON file
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8')
);
// import data into DB
const importData = async() => {
    try {
        await Tour.create(tours);
        await User.create(users);
        await Review.create(reviews);
        console.log('Data successfully loaded');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};
// delete all data from DB
const deleteData = async() => {
    try {
        await Tour.deleteMany();
        await User.deleteMany({ validateBeforeSave: false });
        await Review.deleteMany();
        console.log('Data successfully deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);