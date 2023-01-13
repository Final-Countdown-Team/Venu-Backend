import mongoose from "mongoose";
import validator from "validator";
import slugify from "slugify";

import {
  changedPasswordAfterUtil,
  correctPasswordUtil,
  saveAndCreateTokenUtil,
} from "./modelMiddleware/instanceMethods.js";
import { hashingPassword } from "../utils/hashingPassword.js";

const artistSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["artists"],
      default: "artists",
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
      default:
        "https://res.cloudinary.com/dpfykfp1m/image/upload/v1669645444/venu/default_profileImage/default_user_small_smuxut.png",
    },
    images: {
      type: [String],
      default: ["empty-0", "empty-1", "empty-2"],
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
        "Alternative",
        "Classic",
        "Country",
        "Electronic",
        "Experimental",
        "Folk",
        "Hip-Hop",
        "Jazz",
        "Metal",
        "Rock",
        "Schlager",
        "Singer-Songwriter",
      ],
    },
    dates: [Date],
    members: {
      type: Number,
    },
    slug: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    confirmDateToken: String,
    confirmDateTokenExpires: Date,
    confirmDate: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
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

// Create URL slug from name
artistSchema.pre("save", function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true });
  next();
});

// VIRTUAL PROPERTIES
artistSchema.virtual("availability").get(function () {
  if (!this.dates) return;
  return this.dates.length >= 1;
});

artistSchema.virtual("bookedDates", {
  ref: "ConfirmedDate",
  foreignField: "artist",
  localField: "_id",
});

// INSTANCE METHODS
// Comparing password when logging in
artistSchema.methods.correctPassword = async function (candidatePW) {
  return await correctPasswordUtil(candidatePW, this);
};
// Generate and hash reset token and save it to current document
artistSchema.methods.createPasswordResetToken = function () {
  return saveAndCreateTokenUtil(
    this.passwordResetToken,
    this.passwordResetExpires
  );
};
artistSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  return changedPasswordAfterUtil(JWTTimestamp, this);
};
// Generte and has a confirmDate token
artistSchema.methods.createConfirmDateToken = function () {
  return saveAndCreateTokenUtil(
    this.confirmDateToken,
    this.confirmDateTokenExpires
  );
};

// Query middleware
artistSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const Artist = mongoose.model("Artist", artistSchema);
export default Artist;
