const Review = require('../module/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const createSuccessResponse = (res, statusCode, review) => {
    res.status(statusCode).json({
        status: 'success',
        data: {
            review,
        },
    });
};

exports.getAllReviews = catchAsync(async(req, res, next) => {
    const allReview = await Review.find();
    allReview
        ?
        createSuccessResponse(res, 200, allReview) :
        next(AppError('no review found', 404));
});

exports.getOneReview = catchAsync(async(req, res, next) => {
    const review = await Review.findById(req.params.id);
    review
        ?
        createSuccessResponse(res, 200, review) :
        next(AppError('no review found with that Id', 404));
});
exports.updateReview = catchAsync(async(req, res, next) => {
    const review = await Review.findById(req.params.id, req.user, {
        new: true,
        runValidators: true,
    });
    review
        ?
        createSuccessResponse(res, 200, review) :
        next(AppError('no review found with that Id', 404));
});
exports.createReview = catchAsync(async(req, res, next) => {
    const review = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        tour: req.body.tour,
        user: req.body.user,
    });
    review
        ?
        createSuccessResponse(res, 201, review) :
        next(AppError('No review Created', 404));
});
exports.deleteReview = catchAsync(async(req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);
});