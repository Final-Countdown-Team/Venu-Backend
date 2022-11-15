import express from "express";
import { login, signup } from "../controllers/authController.js";
import {
  createVenue,
  deleteVenue,
  getAllVenues,
  getVenue,
  updateVenue,
} from "../controllers/venueController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
// router.route("/logout").get(logout);

router.route("/").get(getAllVenues).post(createVenue);

router.route("/:id").get(getVenue).patch(updateVenue).delete(deleteVenue);

export default router;
