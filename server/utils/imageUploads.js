import multer from "multer";
import Datauri from "datauri/parser.js";
import cloudinary from "../config/cloudinaryConfig.js";
import AppError from "./appError.js";
import catchAsync from "./catchAsync.js";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadImages = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

export const processImages = catchAsync(async (req, res, next) => {

  // if (!req?.files?.profileImage && !req?.files?.images) return next();
  if (req?.files?.profileImage) {
    console.log("Uploading profileImage...");
    // 1) PROFILE IMAGES
    /* Setting custom filename for user profileImage
    each user is only allowed to have 1 profile iamge in the cloud */
    const profileImageName = `${req.user.name}-${req.user._id}`;

    const parser = new Datauri();

    const imagePath = parser.format(
      profileImageName,
      req.files.profileImage[0].buffer
    );

    const result = await cloudinary.uploader.upload(imagePath.content, {
      public_id: imagePath.fileName,
      width: 1050,
      crop: "limit",
      format: "jpg",
      folder: `venu/${req.user.type}/${req.user.email}/profileImages`,
      overwrite: true,
    });

    console.log(result);
    if (!result)
      throw new AppError(
        "An error occured uploading the profileImage",
        500
      );
    req.body.profileImage = result.url;
  }

  if (req?.files?.images) {
    console.log("Uploading images...");
    req.body.images = new Array(3).fill("");
    console.log(req.body.images);

    await Promise.all(
      req.files.images.map(async (file, i) => {
        // Get the index where the new image should be inserted in the array
        const replaceAt = +file.originalname.charAt(
          file.originalname.length - 1
        );
        if (file.originalname.includes("delete-me")) {
          req.body.images.splice(replaceAt, 1, "delete-me");
          return;
        } else {
          const filename = `image-${replaceAt}-${req.user.name}-${req.user._id}`;

          const parser = new Datauri();
          const filePath = parser.format(filename, file.buffer);

          const result = await cloudinary.uploader.upload(
            filePath.content,
            {
              public_id: filePath.fileName,
              folder: `venu/${req.user.type}/${req.user.email}/images`,
              overwrite: true,
            }
          );
          if (!result)
            throw new AppError(
              "An error occured uploading the images",
              500
            );
          // Insert the uploaded image at the right position
          req.body.images.splice(replaceAt, 1, result.url);
        }
      })
    );
  }
  next();
});
