import mongoose from 'mongoose';
import validator from 'validator';
import slugify from 'slugify';

import { hashingPassword } from '../utils/hashingPassword.js';
import {
  changedPasswordAfterUtil,
  correctPasswordUtil,
  createPasswordResetTokenUtil,
} from './modelMiddleware/instanceMethods.js';

const venueSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['venue'],
      default: 'venue',
    },
    name: {
      type: String,
      required: [true, 'Please enter a name for your venue'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email address'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      unique: true,
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please enter your street'],
      },
      city: {
        type: String,
        required: [true, 'Please enter your city'],
      },
      zipcode: {
        type: String,
        required: [true, 'Please enter your zipcode'],
      },
    },
    location: {
      // geoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: [
          checkCoordinates,
          'The coordinates array is only allowed to have 2 values',
        ],
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
      },
    },
    profileImage: {
      type: String,
      default: 'default.jpeg',
    },
    images: {
      type: [String],
      validate: [
        imageArrayLimit,
        'The maximum amount of images cannot exceed 3',
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
      websiteUrl: {
        type: String,
      },
    },
    dates: [Date],
    capacity: String,
    slug: String,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// INDEXES
venueSchema.index({ name: 1 });
venueSchema.index({ location: '2dsphere' });

// VALIDATE FUNCTIONS
// Limit length of if image array to <= 3.
function imageArrayLimit(val) {
  return val.length <= 3;
}

function checkCoordinates(val) {
  return val.length == 2;
}

// PRE HOOKS
// Hashing password before saving to database
venueSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  await hashingPassword(this);
  next();
});
// Updating passwordChanged at when password is modified
venueSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// Create URL slug from name
venueSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// VIRTUAL PROPERTIES
venueSchema.virtual('availability').get(function () {
  return this.dates.length >= 1;
});

// INSTANCE METHODS
// Comparing password when logging in
venueSchema.methods.correctPassword = async function (candidatePW) {
  return await correctPasswordUtil(candidatePW, this);
};
// Generate and hash reset token and save it to current document
venueSchema.methods.createPasswordResetToken = function () {
  return createPasswordResetTokenUtil(this);
};
venueSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  return changedPasswordAfterUtil(JWTTimestamp, this);
};

// Query middleware
// Only show active venues
venueSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;
