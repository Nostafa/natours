const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../module/tourModule');
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
// import data into DB
const importData = async() => {
    try {
        await Tour.create(tours);
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