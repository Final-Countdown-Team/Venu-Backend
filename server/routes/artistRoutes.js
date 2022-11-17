import express from "express";

import {
	getArtist,
	getAllArtists,
	createArtist,
	updateArtist,
	deleteArtist,
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

import { deleteMe, getMe, updateMe } from "../controllers/userController.js";

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
// router.route("/").get(getArtists).post(createArtist);

// PROTECTED AND RESTRICTED ROUTES
router.use(protect(Artist));
router.use(restrictTo("artist"));

router.get("/user/me", getMe, getArtist);
router.patch("/user/updateMyPassword", updatePassword(Artist));
router.patch("/user/updateMe", updateMe(Artist));
router.delete("/user/deleteMe", deleteMe(Artist));

// router.route("/:id").get(getArtist).patch(updateArtist).delete(deleteArtist);

export default router;
