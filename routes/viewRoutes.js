const express = require('express');
const  viewController = require('./../controllers/viewController')
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController')

const router = express.Router()


router.get('/', bookingController.crrateBookingsCheckout, authController.isLoggedin, viewController.getOverview)
router.get('/tours/:slug', authController.isLoggedin, viewController.getTour);
router.get('/login',authController.isLoggedin, viewController.getLogIn)
router.get('/signup', authController.isLoggedin, viewController.getSignup)
router.get('/me', authController.protect, viewController.getAccount)
router.get('/my-bookings', authController.protect, viewController.myBookings)

module.exports = router