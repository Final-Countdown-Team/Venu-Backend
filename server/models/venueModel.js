import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { hashingPassword } from "../utils/hashingPassword.js";

const venueSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["venue"],
    default: "venue",
  },
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
  address: {
    street: {
      type: String,
      required: [true, "Please enter your street"],
    },
    city: {
      type: String,
      required: [true, "Please enter your city"],
    },
    zipcode: {
      type: String,
      required: [true, "Please enter your zipcode"],
    },
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
  profileImage: {
    type: String,
    default: "default.jpeg",
  },
  images: {
    type: [String],
    validate: [imageArrayLimit, "The maximum amount of images cannot exceed 3"],
  },
  description: String,
  website: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Limit length of if image array to <= 3.
function imageArrayLimit(val) {
  return val.length <= 3;
}

// Hashing password before saving to database
venueSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  await hashingPassword(this);
  next();
});
// Updating passwordChanged at when password is modified
venueSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() + 60 * 60 * 1000 - 1000;
  next();
});
// Comparing password when loggin in
venueSchema.methods.correctPassword = async function (candidatePW) {
  return await bcrypt.compare(candidatePW, this.password);
};

// INSTANCE METHODS
// Generate and hash reset token and save it to current document
venueSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

venueSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp);
    console.log(JWTTimestamp);
    console.log(JWTTimestamp < changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// Query middleware
// Only show active venues
venueSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
