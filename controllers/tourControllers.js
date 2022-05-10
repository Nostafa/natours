const Tour = require('../module/tourModule');
const ApiFeatures = require('../utils/apiFeatures');

// * Handling errors in async functions
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//! Get top five tours
exports.getTopFive = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

//! Get all tours
exports.getAllTours = catchAsync(async(req, res, next) => {
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
});

//! create new tour
exports.createTour = catchAsync(async(req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            newTour,
        },
    });
});

//! Get tour by id
exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    !tour
        ?
        next(new AppError(`No tour found with id ${req.params.id}`, 404)) :
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
});

//! updateTour
exports.updateTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    !tour
        ?
        next(new AppError(`No tour found with id ${req.params.id}`, 404)) :
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
});

//! Delete tour
exports.deleteTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    !tour
        ?
        next(new AppError(`No tour found with id ${req.params.id}`, 404)) :
        res.status(204).json({
            status: 'success',
            message: 'Tour deleted was successful',
        });
});

exports.getTourStats = catchAsync(async(req, res, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
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
});