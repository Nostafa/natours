const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewControllers = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authControllers');

router
    .route('/')
    .get(authControllers.protect, reviewControllers.getAllReviews)
    .post(
        authControllers.protect,
        authControllers.restrictTo('user'),
        reviewControllers.setTourUserId,
        reviewControllers.createReview
    );

router
    .route('/:id')
    .get(reviewControllers.getOneReview)
    .patch(authControllers.protect, reviewControllers.updateReview)
    .delete(authControllers.protect, reviewControllers.deleteReview);

module.exports = router;