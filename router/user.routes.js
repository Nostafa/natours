const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);

router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
    '/updatePassword',
    authController.protect,
    authController.updatePassword
);

router.get(
    '/me',
    authController.protect,
    userController.getMe,
    userController.getUser
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router
    .route('/')
    .get(
        authController.protect,
        authController.restrictTo('admin'),
        userController.getAllUser
    );
router
    .route('/:id')
    .get(
        authController.protect,
        authController.restrictTo('admin'),
        userController.getUser
    )
    .patch(authController.protect, userController.updateMe)
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        userController.updateUser
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        userController.deleteUser
    );

module.exports = router;