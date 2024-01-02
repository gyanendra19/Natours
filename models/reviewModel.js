const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    }
    ,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']

    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match : { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ])
    // console.log(stats)
    await Tour.findByIdAndUpdate(tourId, {
        ratingAverage: stats[0].nRating,
        ratingQuantity: stats[0].avgRating,
    })
}

reviewSchema.post('save', function(){
    this.constructor.calcAverageRatings(this.tour)
    console.log(this)
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    console.log(this.r, 'goo')
    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review