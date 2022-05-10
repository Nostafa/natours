const express = require('express');
const router = express.Router();
const reviewControllers = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authControllers');

router
    .route('/')
    .get(authControllers.protect, reviewControllers.getAllReviews)
    .post(
        authControllers.protect,
        authControllers.restrictTo('user'),
        reviewControllers.createReview
    );

router
    .route('/:id')
    .get(authControllers.protect, reviewControllers.getOneReview)
    .patch(authControllers.protect, reviewControllers.updateReview)
    .delete(authControllers.protect, reviewControllers.deleteReview);

module.exports = router;