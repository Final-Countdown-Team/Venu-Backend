import express from "express";
import app from "../app.js";
import {
  forgotPassword,
  login,
  logout,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
} from "../controllers/authController.js";
import {
  confirmBookedDate,
  contactUser,
  deleteMe,
  getMe,
  reactivateAccount,
  updateMe,
} from "../controllers/userController.js";
import { getAllVenues, getVenue } from "../controllers/venueController.js";
import Admin from "../models/adminModel.js";
import Artist from "../models/artistModel.js";
import Venue from "../models/venueModel.js";
import { processImages, uploadImages } from "../utils/imageUploads.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/signup", uploadImages, processImages, signup(Venue));
router.post("/login", login(Venue));
router.get("/logout", logout);
router.post("/reactivateAccount/:id", reactivateAccount(Venue));

router.post("/forgotPassword", forgotPassword(Venue));
router.patch("/resetPassword/:token", resetPassword(Venue));

router.get("/", getAllVenues);
router.patch("/confirmBookedDate/:token", confirmBookedDate(Venue));

// PROTECT FROM UNAUTHORIZED USERS
router.use(protect(Venue, Artist));
router.get("/:id", getVenue);
router.post("/contactUser/:id", contactUser(Venue));

// PROTECTED AND RESTRICTED ROUTES
router.use(protect(Venue));
router.use(restrictTo("venues"));

router.get("/user/me", getMe, getVenue);
router.patch("/user/updateMyPassword", updatePassword(Venue));
router.patch(
  "/user/updateMe",
  uploadImages,
  processImages,
  updateMe(Venue)
);
router.delete("/user/deleteMe", deleteMe(Venue));

// TODO: RESTRICT TO ADMINS
router.use(protect(Admin));
router.use(restrictTo("admin"));

export default router;
