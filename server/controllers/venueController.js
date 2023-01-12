import Venue from "../models/venueModel.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";

export const getAllVenues = getAll(Venue);
export const getVenue = getOne(Venue, { path: "bookedDates" });
export const createVenue = createOne(Venue);
export const updateVenue = updateOne(Venue);
export const deleteVenue = deleteOne(Venue);
