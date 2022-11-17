import express from "express";

import Admin from "../models/adminModel.js";
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
  createAdmin,
  getAdmin,
  getAdmins,
} from "../controllers/adminController.js";
import { deleteMe, getMe, updateMe } from "../controllers/userController.js";
import {
  createVenue,
  deleteVenue,
  updateVenue,
} from "../controllers/venueController.js";
import {
  createArtist,
  deleteArtist,
  updateArtist,
} from "../controllers/artistController.js";

const router = express.Router();

// First signup only for creating first admin, after that user needs to be logged in as admin to create other admins and this line should be commented out
// router.post("/signup", signup(Admin));
router.post("/login", login(Admin));
router.get("/logout", logout);

// PROTECTED AND RESTRICTED ROUTES
router.use(protect(Admin));
router.use(restrictTo("admin"));

// Securing the password reset routes, so only other logged in admins can send tokens to admins who forgot their password
router.post("/forgotPassword", forgotPassword(Admin));
router.patch("/resetPassword/:token", resetPassword(Admin));

router.get("/admin/me", getMe, getAdmin);
router.patch("/admin/updateMyPassword", updatePassword(Admin));
router.patch("/admin/updateMe", updateMe(Admin));
router.delete("/admin/deleteMe", deleteMe(Admin));

// ACESS TO VENUES
router.post("/venues", createVenue);
router.route("/venues/:id").patch(updateVenue).delete(deleteVenue);

// ACCESS TO ARTISTS
router.post("/artists", createArtist);
router.route("/artists/:id").patch(updateArtist).delete(deleteArtist);

// ACCESS TO ADMINS
router.route("/").get(getAdmins).post(createAdmin);
router.get("/:id", getAdmin);

export default router;
