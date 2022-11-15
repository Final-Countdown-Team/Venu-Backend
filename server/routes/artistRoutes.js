import express from 'express';

import {
	getArtist,
	getArtists,
	createArtist,
	updateArtist,
	deleteArtist,
} from "../controllers/artistController.js";

const router = express.Router();

router.route('/').get(getArtists).post(createArtist);

router.route('/:id').get(getArtist).patch(updateArtist).delete(deleteArtist);


export default router;
