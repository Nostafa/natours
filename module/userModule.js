const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        loadClass: true,
        validate: [validator.isEmail, 'Please add a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //! This only works on CREATE and SAVE!!!
            validator: function(el) {
                return el === this.password;
            }, //* this.password is the password field in the userSchema
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

//* It hashes the password before saving it to the database
userSchema.pre('save', async function(next) {
    //* If the password is modified, then hash it
    if (!this.isModified('password')) next();
    //* Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //* Delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

//! to check the password
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

//! to check the password is it changed or Not
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt / 1000, 10);
        return jwtTimestamp < changedTimestamp;
    }
    //! false means: There is no changed password
    return false;
};

//! to Send random token to the user to change the password.
userSchema.methods.createPasswordRestToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log(this.passwordResetToken, resetToken);
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;