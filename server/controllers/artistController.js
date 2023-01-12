import Artist from "../models/artistModel.js";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlerFactory.js";

export const getAllArtists = getAll(Artist);
export const getArtist = getOne(Artist, {
  path: "bookedDates",
});
export const createArtist = createOne(Artist);
export const updateArtist = updateOne(Artist);
export const deleteArtist = deleteOne(Artist);
