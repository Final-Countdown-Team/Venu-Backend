import jwt from "jsonwebtoken";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import Venue from "../models/venueModel.js";
import Artist from "../models/artistModel.js";
import Email from "../utils/sendEmail.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

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
    sameSite: "none",
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  // Remove the password form the output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
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
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      profileImage: req.body.profileImage,
      images: req.body.images,
      description: req.body.description,
      mediaLinks: req.body.mediaLinks,
      dates: req.body.dates,
    };
    if (Model === Artist) {
      body.genre = req.body.genre;
      body.members = req.body.members;
    }
    if (Model === Venue) body.capacity = req.body.capacity;
    const user = await Model.create(body);

    try {
      const profileEditURL = `${process.env.FRONTEND_URL}/me/editProfile`;
      await new Email(user, profileEditURL).sendWelcome();
    } catch (err) {
      throw new AppError("An error occured sending the email", 500);
    }

    createSendToken(user, 201, res);
  });
// LOG IN
export const login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      throw new AppError("Please provide email and password", 400);

    const user = await Model.findOne({ email })
      .select("+password")
      .populate({ path: "bookedDates" });

    if (!user || !(await user.correctPassword(password)))
      throw new AppError("Incorrect email or password", 401);

    createSendToken(user, 200, res);
  });
// LOG OUT
export const logout = (req, res) => {
  res.clearCookie("jwt").status(200).json({ status: "success" });
};

// PROTECT ROUTE MIDDLEWARE
export const protect = (Model1, Model2) =>
  catchAsync(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    // Check if token is stored in req.header or in a cookie
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) throw new AppError("Please log in to get access", 401);

    // Validate token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    // Check if document still exists
    //NEEDS TO BE FIXED
    let currentUser;
    currentUser = await Model1.findById(decoded.id);
    if (!currentUser && Model2)
      currentUser = await Model2.findById(decoded.id);

    if (!currentUser)
      throw new AppError(
        "The user does no longer exists or you do not have permission to enter this site",
        404
      );
    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please login again!",
          401
        )
      );
    }
    // Grant access to protected route
    req.user = currentUser;
    next();
  });

// RESTRICT MIDDLEWARE
export const restrictTo = (type) => {
  // type is either 'artists' or 'venues'
  return (req, res, next) => {
    if (!type.includes(req.user.type)) {
      throw new AppError(
        "You do not have permission to perform this action",
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
    if (!user) throw new AppError("No user found", 404);

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    console.log(user);

    // Send un-hashed reset token to user's email
    // const modelURLString = Model.collection.collectionName;
    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/${modelURLString}/resetPassword/${resetToken}`;
    // const message = `Howdy! You forgot your password? Don't worry, use the link below to reset it. The link expires in 10 minutes. Submit a PATCH request with your new password and passwordConfirm to: \n\n${resetURL}\n\nIf you did't forget your password, please ignore this email! `;

    try {
      const resetURL = `${process.env.FRONTEND_URL}/${user.type}/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError("An error occured sending the email", 500);
    }
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  });

// RESET PASSWORD
export const resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // Hash resetToken to compare it to hashed token stored in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    // Find user based on hashed token and check if token has not yet expired
    const user = await Model.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new AppError("Token is invalid or has expired", 400);

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
    console.log(req.user);
    const user = await Model.findById(req.user._id).select("+password");
    // Check if current password is correct
    if (!(await bcrypt.compare(req.body.passwordCurrent, user.password)))
      throw new AppError("Your current password is invalid", 401);
    // Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // Log user in, send new JWT
    createSendToken(user, 200, res);
  });
