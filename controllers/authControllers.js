const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../module/userModule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
// const sendEmail = require('../utils/reEmail');

const tokenJwt = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

const createSendToken = (user, statusCode, res) => {
    const token = tokenJwt(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIES_EXPIRATION_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('JWT', token, cookieOptions);

    //* Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    createSendToken(user, 201, res);
    // const token = tokenJwt(user._id);

    // res.status(201).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user,
    //     },
    // });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = await req.body;

    //* 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    //* 2) Check if email and password are valid
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    //* 3) Check if user exists && password is correct
    createSendToken(user, 200, res);
    // const token = tokenJwt(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    // });
});

exports.protect = catchAsync(async(req, res, next) => {
    //* 1) Getting token and check if it's there
    if (
        req.headers.authorization ||
        req.headers.authorization.startsWith('Bearer')
    ) {
        const token = await req.headers.authorization.split(' ')[1];
        if (!token) {
            return next(
                new AppError('You are not logged in! Please log in first', 401)
            );
        }
        //* 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        // console.log(decoded);
        // //* 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(
                new AppError(
                    'the user belonging to this token dose no longer exist, Please log in to get access',
                    401
                )
            );
        }
        // //* 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(
                new AppError('User recently changed password! Please log in again', 401)
            );
        }
        //* GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    }
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

exports.forgetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on Posted email
    const user = await User.findOne({ email: req.body.email });
    !user && next(new AppError('There is no user with that email address', 404));
    // 2) Generate the random reset token
    const restToken = user.createPasswordRestToken();
    await user.save({ validateBeforeSave: false });
    // 4) send email with the token to the user's email
    const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${restToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetURL}.\n\nIf you did not make this request, please ignore this email and your password will remain unchanged.`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError('Email could not be sent, please try again later!', 500)
        );
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: new Date() },
    });
    console.log(user);
    // 2) Check if the token is not expired and there is user , set new Password
    !user && next(new AppError('Token is invalid or has expired', 400));
    // console.log(user.password);
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: true });
    // 3) Update ChangePasswordAt property for the user
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
    // const token = tokenJwt(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    // });
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
    // const token = tokenJwt(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    // });
});