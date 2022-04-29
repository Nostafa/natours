const Tour = require('../module/tourModule');
const ApiFeatures = require('../utils/apiFeatures');
// Get top five tours
exports.getTopFive = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

//! Get all tours
exports.getAllTours = async(req, res) => {
    try {
        // ?Execute Query
        const features = new ApiFeatures(Tour.find(), req.query)
            .filtering()
            .sorting()
            .fieldLimiting()
            .pagination();
        const allTours = await features.query;

        //*Send Response
        res.status(200).json({
            status: 'success',
            result: allTours.length,
            data: {
                allTours,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

//! create new tour
exports.createTour = async(req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                newTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

//! Get tour by id
exports.getTour = async(req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

//! updateTour
exports.updateTour = async(req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

//! Delete tour
exports.deleteTour = async(req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            message: 'Tour deleted was successful',
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.getTourStats = async(req, res) => {
    try {
        const status = await Tour.aggregate([{
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
            {
                $sort: { avgPrice: 1 },
            },
        ]);
        res.status(200).json({
            status: 'success',
            results: status.length,
            data: {
                status,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

exports.getMonthlyPlan = async(req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([{
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-30`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            { $addFields: { month: '$_id' } },
            { $project: { _id: 0 } },
            { $sort: { month: 1 } },
        ]);
        res.status(200).json({
            status: 'success',
            results: plan.length,
            data: {
                plan,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};