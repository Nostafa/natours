const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourControllers');

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
    .get(tourController.getAllTours)
    .post(tourController.createTour);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;