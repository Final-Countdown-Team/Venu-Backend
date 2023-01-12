import express from "express";

import {
  getArtist,
  getAllArtists,
} from "../controllers/artistController.js";
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
import { processImages, uploadImages } from "../utils/imageUploads.js";
import Artist from "../models/artistModel.js";
import Venue from "../models/venueModel.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/signup", uploadImages, processImages, signup(Artist));
router.post("/login", login(Artist));
router.get("/logout", logout);
router.post("/reactivateAccount/:id", reactivateAccount(Artist));

router.post("/forgotPassword", forgotPassword(Artist));
router.patch("/resetPassword/:token", resetPassword(Artist));

router.get("/", getAllArtists);
router.patch("/confirmBookedDate/:token", confirmBookedDate(Artist));

// PROTECT FROM UNAUTHORIZED USERS
router.use(protect(Artist, Venue));
router.get("/:id", getArtist);
router.post("/contactUser/:id", contactUser(Artist));

// PROTECTED AND RESTRICTED ROUTES
router.use(protect(Artist));
router.use(restrictTo("artists"));
router.get("/user/me", getMe, getArtist);
router.patch("/user/updateMyPassword", updatePassword(Artist));
router.patch(
  "/user/updateMe",
  uploadImages,
  processImages,
  updateMe(Artist)
);
router.delete("/user/deleteMe", deleteMe(Artist));

export default router;
