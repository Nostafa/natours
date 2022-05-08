const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authControllers');

//! Get the Cheapest five Tours
router
    .route('/top-five')
    .get(tourController.getTopFive, tourController.getAllTours);

//! Get Statistics API
router.route('/tour-status').get(tourController.getTourStats);

//! monthly plan
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//! normal routes
router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = router;