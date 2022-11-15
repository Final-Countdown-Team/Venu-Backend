import jwt from "jsonwebtoken";

import Venue from "../models/venueModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (venue, statusCode, res) => {
  const token = signToken(venue._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  // Remove the password form the output
  venue.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: venue,
  });
};
// --- EXPORTS FOR VENUES ---
// SIGNUP
export const signup = catchAsync(async (req, res, next) => {
  const venue = await Venue.create({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(venue, 201, res);
});
// LOG IN
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Please provide email and password", 400);

  const venue = await Venue.findOne({ email }).select("+password");

  if (!venue || !(await venue.correctPassword(password)))
    throw new AppError("Incorrect email or password", 401);

  createSendToken(venue, 200, res);
});
