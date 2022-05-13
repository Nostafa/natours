const AppError = require('../utils/appError');
const User = require('../module/userModule');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    console.log(obj, allowedFields);
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getAllUser = factory.getAll(User);

//* update Current user
exports.updateMe = catchAsync(async(req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use:  /updatePassword',
                400
            )
        );
    }
    // 2) Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    console.log(filteredBody);
    // 3) Update user document
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});
//* delete current user
exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false,
    });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getUser = factory.getOne(User);
exports.updateUser = factory.deleteOne(User);
exports.deleteUser = factory.deleteOne(User);