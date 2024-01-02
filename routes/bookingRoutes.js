const express = require('express');
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController')
const router = express.Router();

router.use(authController.protect)

router.get('/checkout/:tourId', bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin'))
router.route('/').get(bookingController.allBookings).post(bookingController.createBookings)
router.route('/:id').get(bookingController.oneBooking).patch(bookingController.updateBookings).delete(bookingController.deleteBookings)

module.exports = router;