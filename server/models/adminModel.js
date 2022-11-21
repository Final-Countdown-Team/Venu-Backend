import mongoose from "mongoose";
import validator from "validator";

import { hashingPassword } from "../utils/hashingPassword.js";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Please enter valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    type: {
      type: String,
      default: "admin",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypting password before saving admin
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  await hashingPassword(this);
  next();
});
// Updating passwordChanged at when password is modified
adminSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// INSTANCE METHODS
// Comparing password when logging in
adminSchema.methods.correctPassword = async function (candidatePW) {
  return await correctPasswordUtil(candidatePW, this);
};
// Generate and hash reset token and save it to current document
adminSchema.methods.createPasswordResetToken = function () {
  return createPasswordResetTokenUtil();
};
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  return changedPasswordAfterUtil(JWTTimestamp, this);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
