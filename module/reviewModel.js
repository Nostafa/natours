const mongoose = require('mongoose');

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
const Reviews = mongoose.model('Reviews', reviewsSchema);
module.exports = Reviews;