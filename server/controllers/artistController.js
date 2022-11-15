import Artist from "../models/artistModel";

export const getArtists = async (req, res) => {
	try {
		const artists = await Artist.find();
		res.status(200).json({ artists });
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

export const getArtist = async (req, res) => {
	const { id } = req.params;
	try {
		const artist = await Artist.findById(id);
		res.status(200).json(artist);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

export const createArtist = async (req, res) => {
	const artist = req.body;
	const newArtist = new Artist(artist);
	try {
		await newArtist.save();
		res.status(200).json(newArtist);
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

export const updateArtist = async (req, res) => {
	const filter = { _id: req.params.updateId }; // filter by id
	const options = {
		upsert: true, // Create a document if one isn't found
		new: true,
		runValidators: true,
	};
	const artist = req.body;
	try {
		const updatedArtist = await Artist.findOneAndUpdate(
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
		res.status(200).json(updatedArtist);
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

export const deleteArtist = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id))
		// check if id is not valid
		return res.status(404).send(`No artist with id: ${id}`);
	await Artist.findByIdAndRemove(id); // remove the artist if id is valid
	res.json({ message: "Artist deleted successfully." });
};
