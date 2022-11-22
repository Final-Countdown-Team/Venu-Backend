import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import Venue from '../models/venueModel.js';
import Artist from '../models/artistModel.js';
import sendEmail from '../utils/sendEmail.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // Remove the password form the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

// --- EXPORTS FOR VENUES ---
// SIGNUP
export const signup = (Model) =>
  catchAsync(async (req, res, next) => {
    let body = {
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      location: req.body.location,
      availability: req.body.availability,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      profileImage: req.body.profileImage,
      images: req.body.images,
      description: req.body.description,
      mediaLinks: req.body.mediaLink,
      dates: req.body.dates,
    };
    if (Model === Artist) body.genre = req.body.genre;
    if (Model === Venue) body.capacity = req.body.capacity;

    const user = await Model.create(body);

    createSendToken(user, 201, res);
  });
// LOG IN
export const login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      throw new AppError('Please provide email and password', 400);

    const user = await Model.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password)))
      throw new AppError('Incorrect email or password', 401);

    createSendToken(user, 200, res);
  });
// LOG OUT
export const logout = (req, res) => {
  res.clearCookie('jwt').status(200).json({ status: 'success' });
};

// PROTECT ROUTE MIDDLEWARE
export const protect = (Model) =>
  catchAsync(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    // Check if token is stored in req.header or in a cookie
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) throw new AppError('Please log in to get access', 401);

    // Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // Check if document still exists
    const currentUser = await Model.findById(decoded.id);
    if (!currentUser)
      throw new AppError(
        'The user does no longer exists or you do not have permission to enter this site',
        404
      );
    // NOT WORKING BECAUSE OF DAYLIGHT SAVING TIMES
    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password. Please login again!', 401)
      );
    }
    // Grant access to protected route
    req.user = currentUser;
    next();
  });

// RESTRICT MIDDLEWARE
export const restrictTo = (type) => {
  // type is either 'artist' or 'venue'
  return (req, res, next) => {
    if (!type.includes(req.user.type)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403
      );
    }
    next();
  };
};

// FORGOT PASSWORD
export const forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findOne({ email: req.body.email });
    if (!user) throw new AppError('No user found', 404);

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send un-hashed reset token to user's email
    const modelURLString = Model.collection.collectionName;

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/${modelURLString}/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: \n\n${resetURL}\n\nIf you did't forget your password, please ignore this email! `;

    try {
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Your password reset token (valid for 10 minutes)',
      //   message,
      // });

      // Nodemailer works, but I'm sending it to mailtrap, which is only registered to my github account and I cannot invite any team members. So before setting up mailgun for production, we simply log the email to the console here.
      console.log(message);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('An error occured sending the email', 500);
    }
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  });

// RESET PASSWORD
export const resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // Hash resetToken to compare it to hashed token stored in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    // Find user based on hashed token and check if token has not yet expired
    const user = await Model.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new AppError('Token is invalid or has expired', 400);

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
  });

// UPDATE PASSWORD WHEN USER IS LOGGED IN
export const updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // We get access to req.user from our protect middleware
    const user = await Model.findById(req.user.id).select('+password');
    // Check if current password is correct
    if (!(await bcrypt.compare(req.body.passwordCurrent, user.password)))
      throw new AppError('Your current password is invalid', 401);
    // Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // Log user in, send new JWT
    createSendToken(user, 200, res);
  });
