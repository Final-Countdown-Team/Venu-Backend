import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Artist from "../models/artistModel.js";
import Venue from "../models/venueModel.js";
import Email from "../utils/sendEmail.js";

// Get middleware, forwards to getVenue or getArtists controller in routes
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
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

// CONTACT USER
export const contactUser = (Model) =>
  catchAsync(async (req, res, next) => {
    const contactForm = {
      firstname: req.body.firstname,
      date: req.body.date,
      message: req.body.message,
    };
    const receiver = await Model.findById(req.params.id);
    const sender = req.user;

    console.log(contactForm);
    console.log(receiver);
    console.log(sender);
    try {
      const confirmDateURL = `${req.protocol}://192.168.0.129:3000/me/confirmDate`;
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
      message: "Successfully send contact email",
    });
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
    console.log("Filtered body: ", filteredBody);
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
