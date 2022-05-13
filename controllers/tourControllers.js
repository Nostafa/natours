const Tour = require('../module/tourModule');
const factory = require('./handlerFactory');

// * Handling errors in async functions
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const successOperation = (res, data, statusCode) => {
    res.status(statusCode).json({
        status: 'success',
        result: data.length,
        data,
    });
};
//! Get top five tours
exports.getTopFive = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

//! Get all tours
exports.getAllTours = factory.getAll(Tour);

//! create new tour
exports.createTour = factory.createOne(Tour);

//! Get tour by id
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

//! updateTour
exports.updateTour = factory.updateOne(Tour);

//! Delete tour
exports.deleteTour = factory.deleteOne(Tour);

//?/tours-within/:distance/center/:latlng/unit/:unit
//?/tours-within/400/center/34.111745, -118.113491/unit/kg
exports.getToursWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng)
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        );
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ],
            },
        },
    });
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: tours,
    });
});

//? '/distances/:latlng/unit/:unit'
exports.getDistances = catchAsync(async(req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if ((!lat, !lng))
        next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        );
    const distances = await Tour.aggregate([{
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);
    successOperation(res, distances, 200);
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