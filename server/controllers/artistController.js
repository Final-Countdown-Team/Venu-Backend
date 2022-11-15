import Artist from "../models/artistModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getArtists = catchAsync(async (req, res, next) => {
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
	const artist = req.body;
	const newArtist = new Artist(artist);
	await newArtist.save();

	res.status(200).json({
		status: "success",
		data: newArtist,
	});
});


export const updateArtist = catchAsync(async (req, res, next) => {
	const filter = { _id: req.params.updateId }; // filter by id
	const options = {
		new: true,
		runValidators: true,
	};
	const artist = req.body;
	const updatedArtist = await Artist.findByIdAndUpdate(
		filter,
		{
			// update the artist
			name: artist.name,
			genre: artist.genre,
			role: artist.role,
			genre: artist.genre,
			medialLinks: {
				facebookUrl: artist.medialLinks.facebookUrl,
				twitterUrl: artist.medialLinks.twitterUrl,
				instagramUrl: artist.medialLinks.instagramUrl,
				youtubeUrl: artist.medialLinks.youtubeUrl,
			},
			imageUrl: artist.imageUrl,
			albums: artist.albums,
			description: artist.description,
			address: {
				street: artist.address.street,
				city: artist.address.city,
				zipcode: artist.address.zipcode,
			},
		},
		options
	);
	res.status(200).json({
		status: "success",
		data: updatedArtist
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


