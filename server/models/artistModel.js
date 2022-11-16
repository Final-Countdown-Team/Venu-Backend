import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

import { hashingPassword } from "../utils/hashingPassword.js";

const artistSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["artist"],
    default: "artist",
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  genre: {
    type: String,
    required: [true, "Please provide a genre"],
  },
  address: {
    street: {
      type: String,
      required: [true, "Please provide a street"],
    },
    city: {
      type: String,
      required: [true, "Please provide a city"],
    },
    zipcode: {
      type: String,
      required: [true, "Please provide a zip"],
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 4,
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
  profileImage: {
    type: String,
    default: "default.jpg",
  },
  images: {
    type: [String],
    validate: [imageArrayLimit, "The maximum amount of images cannot exceed 3"],
  },
  description: String,
  mediaLinks: {
    facebookUrl: {
      type: String,
    },
    twitterUrl: {
      type: String,
    },
    instagramUrl: {
      type: String,
    },
    youtubeUrl: {
      type: String,
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Limit length of if image array to <= 3.
function imageArrayLimit(val) {
  return val.length <= 3;
}

artistSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await hashingPassword(this);
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt property for the user
artistSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware
artistSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance method
artistSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.Password);
};

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;
