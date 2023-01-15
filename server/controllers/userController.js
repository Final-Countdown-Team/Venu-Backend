import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Artist from "../models/artistModel.js";
import Venue from "../models/venueModel.js";
import Email from "../utils/sendEmail.js";
import crypto from "crypto";
import ConfirmedDate from "../models/confirmedDateModel.js";
import { clear } from "console";

// Get middleware, forwards to getVenue or getArtists controller in routes
export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// Filter function to filter out unwanted fields
const filterObj = (obj, ...notAllowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!notAllowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Helper function to see if a date is already booked
const checkForExistingDate = (bookedDates, confirmDate) => {
  return bookedDates.some(
    (date) => date.toDateString() === confirmDate.toDateString()
  );
};

// Clear the fields in both receiver and sender documents
const clearContactUsers = async (receiver, sender) => {
  [receiver, sender].forEach((user) => {
    user.confirmDate = undefined;
    user.confirmDateToken = undefined;
    user.confirmDateTokenExpires = undefined;
  });
};

const updateDateArray = (receiver, sender, bookedDate) => {
  [receiver, sender].forEach(async (user) => {
    const index = user.dates.findIndex(
      (date) => new Date(date).getTime() === new Date(bookedDate).getTime()
    );
    user.dates.splice(index, 1);
  });
};

// CONTACT USER
// Request will be send on the route of the watchUser, meaning req.params.id
export const contactUser = (Model) =>
  catchAsync(async (req, res, next) => {
    const receiverModel = Model === Artist ? Artist : Venue;
    const senderModel = receiverModel === Artist ? Venue : Artist;

    const receiver = await receiverModel.findById(req.params.id);
    if (!receiver)
      throw new AppError("No user found, who should be contacted", 404);

    const sender = await senderModel.findById(req.user._id);
    if (!sender)
      throw new AppError(
        "No user found, who should send the contact",
        404
      );

    const confirmToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(confirmToken)
      .digest("hex");
    const tokenExpiration = Date.now() + 48 * 60 * 60 * 1000;

    [receiver, sender].forEach((user) => {
      user.confirmDateToken = hashedToken;
      user.confirmDateTokenExpires = tokenExpiration;
      user.confirmDate = req.body.date;
    });
    await receiver.save({ validateBeforeSave: false });
    await sender.save({ validateBeforeSave: false });

    console.log(receiver);
    console.log(sender);

    const contactForm = {
      firstname: req.body.firstname,
      date: req.body.date,
      message: req.body.message,
    };

    try {
      const confirmDateURL = `${req.protocol}://192.168.0.129:3000/${receiver.type}/confirmDate/${confirmToken}`;
      await new Email(receiver, confirmDateURL).sendContact(
        sender,
        contactForm
      );
    } catch (err) {
      console.error(err);
      throw new AppError("An error occurred sending the email", 500);
    }

    res.status(200).json({
      status: "success",
      message: "Successfully sent contact email",
    });
  });

// CONFRIM BOOKED DATE
export const confirmBookedDate = (Model) =>
  catchAsync(async (req, res, next) => {
    const receiverModel = Model === Artist ? Artist : Venue;
    const senderModel = receiverModel === Artist ? Venue : Artist;

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user based on hashed token and check if token has not yet expired
    const receiver = await receiverModel.findOne({
      confirmDateToken: hashedToken,
      // confirmDateTokenExpires: { $gt: Date.now() },
    });
    const sender = await senderModel.findOne({
      confirmDateToken: hashedToken,
      // confirmDateTokenExpires: { $gt: Date.now() },
    });
    if (!receiver || !sender)
      throw new AppError("Confirm token is invalid or has expired", 400);

    // Add or create a new booking doc
    const artist = receiver.type === "artists" ? receiver : sender;
    const venue = receiver.type === "venues" ? receiver : sender;
    const bookedDate = receiver.confirmDate;

    const booking = await ConfirmedDate.findOne({
      $and: [{ artist: artist._id }, { venue: venue._id }],
    });
    if (!booking) {
      const newDocument = await ConfirmedDate.create({
        artist: artist,
        venue: venue,
        bookedDates: [bookedDate],
      });

      res.status(200).json({
        status: "success",
        message: "Successfully created a new booked date",
        data: newDocument,
      });
      return;
    }

    if (checkForExistingDate(booking.bookedDates, bookedDate)) {
      clearContactUsers(receiver, sender);
      throw new AppError("This date has already been booked", 409);
    }

    booking.bookedDates = [...booking.bookedDates, ...[bookedDate]];
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Successfully added a new booked date",
      data: booking,
    });

    updateDateArray(receiver, sender, bookedDate);
    clearContactUsers(receiver, sender);

    await receiver.save({ validateBeforeSave: false });
    await sender.save({ validateBeforeSave: false });
  });

// UPDATE ME
export const updateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    // Throw error if user tries to update password from this route
    if (req.body.password || req.body.passwordConfirm)
      throw new AppError(
        "This route does not allow password updates",
        400
      );
    // Do NOT allow the specified fields to be updateable
    const filteredBody = filterObj(
      req.body,
      "active",
      "type",
      "images",
      "createdAt",
      "passwordChangedAt",
      "passwordResetToken",
      "passwordResetExpires"
    );
    //Update User
    const user = await Model.findById(req.user._id);
    // Merge the two arrays to prevent overwriting images
    console.log(req.body.images);
    if (req.body.images) {
      const mergedImages = req.body.images
        .map((image, i) => {
          if (image === "delete-me") {
            return `empty-${i}`;
          } else if (image === "") {
            return user.images[i] || `empty-${i}`;
          } else {
            return image;
          }
        })
        .filter((el) => el !== "");
      filteredBody.images = mergedImages;
      console.log("Merged images: ", mergedImages);
      console.log("user images: ", user.images);
    }
    const updatedUser = await Model.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  });

// DELETE ME

export const deleteMe = (Model) =>
  catchAsync(async (req, res, next) => {
    try {
      const reactivateURL = `${req.protocol}://192.168.0.129:3000/${req.user.type}/reactivateAccount/${req.user._id}`;
      await new Email(req.user, reactivateURL).sendGoodbye();
    } catch (err) {
      console.error(err);
      throw new AppError("An error occured sending the email", 500);
    }
    await Model.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

// REACTIVATE ACCOUNT
export const reactivateAccount = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.updateOne(
      { _id: req.params.id },
      { active: true }
    );
    res.status(204).json({
      status: "success",
      msg: "Successfully reactivated account",
    });
  });
