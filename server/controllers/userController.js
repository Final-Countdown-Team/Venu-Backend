import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

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
    await Model.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
