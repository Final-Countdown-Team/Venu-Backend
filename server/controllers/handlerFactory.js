import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/APIFeatures.js";

export const getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
      Model.find().populate(populateOptions),
      req.query
    )
      .searchName()
      .searchDates()
      .searchGenre()
      .sort()
      .limitFields()
      .paginate()
      .getWithinDistance();

    const docs = await features.mongoQuery;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id).populate(populateOptions);

    if (!doc) throw new AppError("No user found with that ID", 404);

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const updateArtist = (Model) =>
  catchAsync(async (req, res, next) => {
    const options = {
      new: true,
      runValidators: true,
    };
    const updatedDoc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      options
    );
    res.status(200).json({
      status: "success",
      data: updatedDoc,
    });

    if (!updatedDoc) throw new AppError("No user found with that ID", 404);

    res.status(200).json({
      status: "success",
      data: updatedDoc,
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) throw new AppError("No user found with that ID", 404);

    res.status(204).json({
      status: "success",
      message: "User deleted successfully",
      data: null,
    });
  });
