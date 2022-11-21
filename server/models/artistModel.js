import mongoose from "mongoose";
import validator from "validator";

import { hashingPassword } from "../utils/hashingPassword.js";

const artistSchema = mongoose.Schema(
  {
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
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: [
          checkCoordinates,
          "The coordinates array is only allowed to have 2 values",
        ],
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
      },
    },
    profileImage: {
      type: String,
      default: "default.jpg",
    },
    images: {
      type: [String],
      validate: [
        imageArrayLimit,
        "The maximum amount of images cannot exceed 3",
      ],
    },
    description: String,
    mediaLinks: {
      facebookUrl: {
        type: String,
      },
      twitterTag: {
        type: String,
      },
      instagramTag: {
        type: String,
      },
      youtubeUrl: {
        type: String,
      },
    },
    genre: {
      type: String,
      enum: [
        "Rock",
        "Indie",
        "Hip-Hop",
        "Electronic",
        "Experimental",
        "Alternative",
        "Metal",
        "Classic",
        "Singer-Songwriter",
        "Country",
        "Schlager",
      ],
      required: [true, "Please provide a genre"],
    },
    dates: [Date],
    price: {
      type: Number,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
// INDEXES
artistSchema.index({ name: 1 });
artistSchema.index({ location: "2dsphere" });

// VALIDATE FUNCTIONS
// Limit length of if image array to <= 3.
function imageArrayLimit(val) {
  return val.length <= 3;
}
function checkCoordinates(val) {
  return val.length == 2;
}

// PRE HOOKS
artistSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  await hashingPassword(this);
  next();
});

// Update passwordChangedAt property for the user
artistSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// INSTANCE METHODS
// Comparing password when logging in
artistSchema.methods.correctPassword = async function (candidatePW) {
  return await correctPasswordUtil(candidatePW, this);
};
// Generate and hash reset token and save it to current document
artistSchema.methods.createPasswordResetToken = function () {
  return createPasswordResetTokenUtil();
};
artistSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  return changedPasswordAfterUtil(JWTTimestamp, this);
};

// Query middleware
artistSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;
