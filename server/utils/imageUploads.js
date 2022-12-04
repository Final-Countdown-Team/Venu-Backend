import multer from "multer";
import Datauri from "datauri/parser.js";
import cloudinary from "../config/cloudinaryConfig.js";

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

export const processImages = async (req, res, next) => {
  if (!req?.files?.profileImage || !req?.files?.images) return next();
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
    folder: `venu/users/${req.user.name}/profileImages`,
    overwrite: true,
  });

  req.body.profileImage = result.url;

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `image-${i}-${req.user.name}-${req.user._id}`;

      const parser = new Datauri();
      const filePath = parser.format(filename, file.buffer);

      const result = await cloudinary.uploader.upload(filePath.content, {
        public_id: filePath.fileName,
        folder: `venu/users/${req.user.name}/images`,
        overwrite: true,
      });
      req.body.images.push(result.url);
    })
  );

  next();
};
