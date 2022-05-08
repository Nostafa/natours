const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A Tour name must have less or equal then 40 characters'],
        minlength: [10, 'A Tour name must have more or equal then 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: { type: Number, required: [true, 'A Tour must have a duration'] },
    maxGroupSize: {
        type: Number,
        required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult',
        },
    },
    price: { type: Number, required: [true, 'A Tour must have a price'] },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                //* this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: `Discount price ({VALUE}) should be below the regular price`,
        },
        default: 0,
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    summary: {
        type: String,
        required: [true, 'A Tour must have a description'],
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A Tour must have a cover image'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    startDates: [Date],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

//Document middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Virtual populate
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;