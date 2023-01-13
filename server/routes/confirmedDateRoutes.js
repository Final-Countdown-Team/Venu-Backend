import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getAllConfirmedDates,
  getConfirmedDate,
  createConfirmedDate,
  deleteConfirmedDate,
  checkForExistingBooking,
} from "../controllers/confirmedDatesController.js";
import Artist from "../models/artistModel.js";
import Venue from "../models/venueModel.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllConfirmedDates);
// PROTECT FROM UNAUTHORIZED USERS
router.use(protect(Artist, Venue));
router.post("/", checkForExistingBooking, createConfirmedDate);
router.get("/:id", getConfirmedDate);
router.delete("/", deleteConfirmedDate);

export default router;
