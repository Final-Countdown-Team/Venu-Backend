import express from 'express';

import {
	getArtist,
	getArtists,
	createArtist,
	updateArtist,
	deleteArtist,
} from "../controllers/artistController";

const router = express.Router();

router.get('/').get(getArtists).post(createArtist);

router.get('/:id').get(getArtist).patch(updateArtist).delete(deleteArtist);


export default router;
