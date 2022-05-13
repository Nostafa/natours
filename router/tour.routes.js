const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authControllers');
const reviewRouter = require('./review.routes');

// ? Review Route
router.use('/:tourId/review', reviewRouter);
//! Get the Cheapest 5 Tours
router
    .route('/top-five')
    .get(tourController.getTopFive, tourController.getAllTours);

//! Get Statistics API
router.route('/tour-status').get(tourController.getTourStats);

//! monthly plan
router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan
    );

//! Geospatial route
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
//! normal routes
router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'user'),
        tourController.createTour
    );
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'user'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'user'),
        tourController.deleteTour
    );

module.exports = router;