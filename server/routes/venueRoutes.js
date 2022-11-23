import express from 'express';
import app from '../app.js';
import {
  forgotPassword,
  login,
  logout,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
} from '../controllers/authController.js';
import {
  deleteMe,
  getMe,
  updateMe,
} from '../controllers/userController.js';
import {
  getAllVenues,
  getVenue,
} from '../controllers/venueController.js';
import Admin from '../models/adminModel.js';
import Venue from '../models/venueModel.js';
import {
  processProfileImage,
  uploadProfileImage,
} from '../utils/imageUploads.js';

const router = express.Router();

// PUBLIC ROUTES
router.post('/signup', signup(Venue));
router.post('/login', login(Venue));
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword(Venue));
router.patch('/resetPassword/:token', resetPassword(Venue));

router.get('/', getAllVenues);
router.get('/:id', getVenue);

// PROTECTED AND RESTRICTED ROUTES
router.use(protect(Venue));
router.use(restrictTo('venue'));

router.get('/user/me', getMe, getVenue);
router.patch('/user/updateMyPassword', updatePassword(Venue));
router.patch(
  '/user/updateMe',
  uploadProfileImage,
  processProfileImage,
  updateMe(Venue)
);
router.delete('/user/deleteMe', deleteMe(Venue));

// TODO: RESTRICT TO ADMINS
router.use(protect(Admin));
router.use(restrictTo('admin'));

export default router;
