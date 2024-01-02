const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, 'Provide valid e-mail']
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: 8,
        select: false
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    confirmPassword: {
        type: String,
        required: [true, 'confirmPassword is required'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    tokenExpiresIn: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; 
    next()
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next()
})

userSchema.pre(/^find/, function(next){
    this.find({ active : { $ne: false}});
    next()
})

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
     const compare = await bcrypt.compare(candidatePass, userPass)
     console.log(compare, `💥`)
    return compare
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return  JWTTimeStamp < changedTimeStamp
    }
    
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.tokenExpiresIn = Date.now() + 10 * 60 * 1000

    console.log({resetToken}, this.passwordResetToken)
    // console.log(process.env)
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User