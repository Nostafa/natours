const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');
const reviewControllers = require('../controllers/reviewControllers');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);

router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
    '/updatePassword',
    authController.protect,
    authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router
    .route('/')
    .get(userController.getAllUser)
    .post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(authController.protect, userController.updateMe)
    .delete(userController.deleteUser);

//* review route
router
    .route('/:tourId/review')
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewControllers.createReview
    );

module.exports = router;