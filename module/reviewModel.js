const mongoose = require('mongoose');
const Tour = require('./tourModule');
const reviewsSchema = mongoose.Schema({
    review: {
        type: String,
        // required: [true, 'Review can not be empty'],
    },

    rating: {
        type: Number,
        max: 5,
        min: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        // required: [true, 'Review must belong to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        // required: [true, 'Review must belong to a user'],
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'user',
    //     select: 'name photo',
    // }).populate({
    //     path: 'tour',
    //     select: 'name',
    // });

    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

reviewsSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([{
            $match: {
                tour: tourId, // tourId is the tourId that is passed in
            },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    // console.log(stats);
    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].nRating,
        ratingsQuantity: stats[0].avgRating,
    });
};

reviewsSchema.post('save', function() {
    //this point to current review
    this.constructor.calcAverageRatings(this.tour);
});

reviewsSchema.pre(/^findOneAnd/, async function(next) {
    this.review = await this.clone();
    // console.log(this.review);
    next();
});

reviewsSchema.post(/^findOneAnd/, async function() {
    // this.review = await this.clone(); :: this is not working Here because the Query has already been executed
    await this.review.constructor.calcAverageRatings(this.review.tour);
});
const Reviews = mongoose.model('Reviews', reviewsSchema);
module.exports = Reviews;