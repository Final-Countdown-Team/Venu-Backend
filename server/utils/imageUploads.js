import multer from 'multer';
import Datauri from 'datauri/parser.js';
import cloudinary from '../config/cloudinaryConfig.js';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadProfileImage = upload.single('profileImage');

export const processProfileImage = async (req, res, next) => {
  if (!req.file) return next();
  // Setting custom filename for user profileImage
  // each user is only allowed to have 1 profile iamge in the cloud
  req.file.filename = `${req.user.name}-${req.user._id}`;

  const parser = new Datauri();

  const imagePath = parser.format(req.file.filename, req.file.buffer);

  const result = await cloudinary.uploader.upload(imagePath.content, {
    public_id: imagePath.fileName,
    folder: '/users/profileImages',
    overwrite: true,
  });

  req.file.url = result.url;

  next();
};
