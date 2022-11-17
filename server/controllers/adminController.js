import Admin from "../models/adminModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getAdmins = catchAsync(async (req, res, next) => {
  const admins = await Admin.find();
  res.status(200).json({
    status: "success",
    results: admins.length,
    data: admins,
  });
});

export const getAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const admins = await Admin.findById(id);

  if (!admins) throw new AppError("No admins found with that ID", 404);

  res.status(200).json({
    status: "success",
    data: admins,
  });
});

export const createAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.create(req.body);

  res.status(200).json({
    status: "success",
    data: admin,
  });
});
