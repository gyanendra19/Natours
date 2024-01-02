const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')
const router = express.Router();

// router.param('id', tourController.checkID)

router.route('/tour-stats').get(tourController.tourStats)
router.route('/monthly-plan/:year').get( authController.restrictTo('lead-guide', 'admin', 'guide'), tourController.monthlyPlan)
router.route('/top-5-tour').get(tourController.aliasTopTour, tourController.getAllTours)
router.route('/').get(tourController.getAllTours).post(authController.protect,
    authController.restrictTo('lead-guide', 'admin'), tourController.createTours);
router.route('/:id').get(tourController.getTour).patch(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.uploadTourPhoto,tourController.resizeTourPhoto, tourController.updateTour).delete(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.deleteTour);
router.use('/:tourId/reviews', reviewRouter)
// router.route('/tours-within/:distance/centre/:latlng/unit/:unit').get(tourController.getToursWithin)
// router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)


module.exports = router;