const mongoose = require('mongoose')
const slugify = require('slugify')


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'maxGroupSize is required'],
    },
    difficulty: {
        type: String,
        required: [true, 'difficulty is required'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'description is required'],
    },
    imageCover: {
        type: String,
        required: [true, 'imageCover is required']
    },
    images: [String],
    secretTours: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.index({ price: 1, ratingAverage: -1})
tourSchema.index({ slug: 1});
tourSchema.index({ startLocation: "2dsphere"})

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next()
})

// tourSchema.post('save', function (doc, next) {
//     console.log(doc)
//     next()
// })

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTours: { $ne: true } });
    this.start = Date.now();
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

// tourSchema.post(/^find/, function (doc, next) {
//     console.log(`${Date.now() - this.start} milliseconds`)
//     next()
// })

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTours: { $ne: true } } })
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;