import Artist from "../models/artistModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllArtists = catchAsync(async (req, res, next) => {
  const artists = await Artist.find();
  res.status(200).json({
    status: "success",
    results: artists.length,
    data: artists,
  });
});

export const getArtist = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const artist = await Artist.findById(id);

  if (!artist) throw new AppError("No artist found with that ID", 404);

  res.status(200).json({
    status: "success",
    data: artist,
  });
});

export const createArtist = catchAsync(async (req, res, next) => {
  const artist = await Artist.create(req.body);

  console.log(artist);
  console.log(req);
  res.status(200).json({
    status: "success",
    data: artist,
  });
});

export const updateArtist = catchAsync(async (req, res, next) => {
  const options = {
    new: true,
    runValidators: true,
  };
  const updatedArtist = await Artist.findByIdAndUpdate(
    req.params.id,
    req.body,
    options
  );
  res.status(200).json({
    status: "success",
    data: updatedArtist,
  });

  if (!updatedArtist) throw new AppError("No artist found with that ID", 404);

  res.status(200).json({
    status: "success",
    data: updatedArtist,
  });
});

export const deleteArtist = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const artist = await Artist.findByIdAndDelete(id);

  if (!artist) throw new AppError("No artist found with that ID", 404);

  res.status(204).json({
    status: "success",
    message: "Artist deleted successfully",
    data: null,
  });
});
