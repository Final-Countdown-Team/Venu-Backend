import ConfirmedDate from "../models/confirmedDateModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { getAll, getOne, createOne, deleteOne } from "./handlerFactory.js";

export const addOrCreateBookingUtil = async (
  receiver,
  sender,
  date,
  res
) => {
  try {
    const artist = receiver.type === "artists" ? receiver : sender;
    const venue = receiver.type === "venue" ? receiver : sender;

    const booking = await ConfirmedDate.findOne({
      artist: artist,
      venue: venue,
    });

    console.log(date);

    if (!booking) {
      const newDocument = await ConfirmedDate.create({
        artist: artist,
        venue: venue,
        bookedDates: [date],
      });

      res.status(200).json({
        status: "success",
        message: "Successfully created a new booked date",
        data: newDocument,
      });
      return;
    }

    if (booking.bookedDates.includes(date))
      return new AppError("This date has already been booked", 409);

    booking.bookedDates = [...booking.bookedDates, ...[date]];
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Successfully added a new booked date",
      data: booking,
    });
    return;
  } catch (err) {
    console.error(err);
  }
};

export const checkForExistingBooking = catchAsync(
  async (req, res, next) => {
    const booking = await ConfirmedDate.findOne({
      artist: req.body.artist,
      venue: req.body.venue,
    });
    if (!booking) return next();

    if (booking.bookedDates.includes(req.body.bookedDate))
      return new AppError("This date has already been booked", 409);

    booking.bookedDates = [
      ...booking.bookedDates,
      ...req.body.bookedDates,
    ];
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Successfully added a new booked date",
      data: booking,
    });
  }
);

export const getAllConfirmedDates = getAll(ConfirmedDate);
export const getConfirmedDate = getOne(ConfirmedDate);
export const createConfirmedDate = createOne(ConfirmedDate);
export const deleteConfirmedDate = deleteOne(ConfirmedDate);
