const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('./../utils/appError.js')
const Booking = require('../models/bookingModel.js')

exports.getOverview = catchAsync(async(req, res) => {
    const tours = await Tour.find()

    res.status(200).render('overview', {
        title: 'ALL TOURS',
        tours
    })
})


exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        field: 'review rating user'
    })

    if(!tour){
        return next(new appError('No tour with this name!!', 404))
    }


    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
})

exports.myBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id})

    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: {$in: tourIds}})

    res.status(200).render('overview', {
        title: 'ALL BOOKINGS',
        tours
    })
})

exports.getLogIn = (req, res) => {
    res.status(200).render('login',{
        title: 'Log to your account'
    })
}

exports.getSignup = (req, res) => {
    res.status(200).render('signup',{
        title: 'singup to your account'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account',{
        title: 'Your account'
    })
}