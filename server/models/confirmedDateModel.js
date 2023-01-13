import mongoose from "mongoose";

const confirmedDateSchema = mongoose.Schema(
  {
    bookedDates: [Date],
    confirmedAt: {
      type: Date,
      default: Date.now(),
    },
    venue: {
      type: mongoose.Schema.ObjectId,
      ref: "Venue",
    },
    artist: {
      type: mongoose.Schema.ObjectId,
      ref: "Artist",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

confirmedDateSchema.pre("save", function (next) {
  if (!this.isModified("bookedDates")) return next();
  this.confirmedAt = Date.now();
  next();
});

confirmedDateSchema.pre(/^find/, function (next) {
  this.populate({
    path: "artist",
    select: "name",
  }).populate({
    path: "venue",
    select: "name",
  });
  next();
});

const ConfirmedDate = mongoose.model("ConfirmedDate", confirmedDateSchema);

export default ConfirmedDate;
