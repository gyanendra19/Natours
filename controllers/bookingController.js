const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel.js');
const Stripe = require('stripe')
const catchAsync = require('../utils/catchAsync.js');
const factory = require('./factoryController.js');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
        const tour = await Tour.findById(req.params.tourId)
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
            customer_email: req.user.email,
            client_reference_id: req.params.tourId,
            line_items: [
              {
                quantity: 1,
                price_data: {
                  currency: 'usd',
                  unit_amount: tour.price * 100,
                  product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                  },
                },
              },
            ],
          });

          res.status(200).json({
                    status: 'success',
                    session
                })

})  


exports.crrateBookingsCheckout = catchAsync(async(req, res, next) => {
  const { tour, user, price } = req.query;

  if(!tour || !user || !price) return next();
  await Booking.create({tour, user, price})

  res.redirect(req.originalUrl.split('?')[0])
}) 

exports.allBookings = factory.getAll(Booking)
exports.oneBooking = factory.getOne(Booking)
exports.createBookings = factory.createOne(Booking)
exports.updateBookings = factory.updateOne(Booking)
exports.deleteBookings = factory.deleteOne(Booking)













// exports.getCheckoutSession = catchAsync(async(req, res, next) => {
//     const tour = Tour.findById(req.params.tourId)
//     const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

//     const session = await stripe.checkout.sessions.create({
//        payment_method_types: ['card'],
//        success_url: `${req.protocol}://${req.get('host')}/`,
//        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//        customer_email: req.user.email,
//        client_reference_id: req.params.tourId,
//        line_items: [
//         {
//             name: tour.name,
//             description: tour.summary,
//             images: [`img/users/user-1.jpeg`],
//             amount: tour.price,
//             currency: 'usd',
//             quantity: 1
//         }
//        ],
//        mode: 'payment'
//     })

//     res.status(200).json({
//         status: 'success',
//         session
//     })
// })