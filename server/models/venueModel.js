import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

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
  profileImage: {
    type: String,
    default: "default.jpg",
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
  images: {
    type: [String],
    validate: [imageArrayLimit, "The maximum amount of images cannot exceed 3"],
  },
  description: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Limit length of if image array to <= 3.
function imageArrayLimit(val) {
  return val.length <= 3;
}

// Hashing password before saving to database
venueSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  await hasingPassword(this);
  next();
});
// Updating passwordChanged at when password is modified
venueSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// Comparing password when loggin in
venueSchema.methods.correctPassword = async function (candidatePW) {
  return await bcrypt.compare(candidatePW, this.password);
};

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
