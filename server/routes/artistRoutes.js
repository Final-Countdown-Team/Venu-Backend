import express from "express";

import { getArtist, getAllArtists } from "../controllers/artistController.js";
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
import { deleteMe, getMe, updateMe } from "../controllers/userController.js";
import {
  processProfileImage,
  uploadProfileImage,
} from "../utils/imageUploads.js";
import Artist from "../models/artistModel.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/signup", signup(Artist));
router.post("/login", login(Artist));
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword(Artist));
router.patch("/resetPassword/:token", resetPassword(Artist));

router.get("/", getAllArtists);
router.get("/:id", getArtist);

// PROTECTED AND RESTRICTED ROUTES
router.use(protect(Artist));
router.use(restrictTo("artist"));

router.get("/user/me", getMe, getArtist);
router.patch("/user/updateMyPassword", updatePassword(Artist));
router.patch(
  "/user/updateMe",
  uploadProfileImage,
  processProfileImage,
  updateMe(Artist)
);
router.delete("/user/deleteMe", deleteMe(Artist));

export default router;
