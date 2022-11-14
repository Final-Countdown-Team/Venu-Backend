import mongoose from "mongoose";
import validator from "validator";

import { hasingPassword } from "../utils/hasingPassword.js";

const venueSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name for your venue"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
    unique: true,
  },
  photo: {
    type: String,
    // default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
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

venueSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  hasingPassword(this);
  next();
});
