import express from 'express';
import { getSeasonCalendar, getRaceResultsById } from '../controllers/raceController.js';

const router = express.Router();

// Route: GET /api/races/calendar
// Desc:  Fetches the historical race calendar (defaults to current year or accepts ?year=YYYY)
router.get('/calendar', getSeasonCalendar);

// Route: GET /api/races/:id/results
// Desc:  Fetches the final classification/results for a specific session ID
router.get('/:id/results', getRaceResultsById);

export default router;