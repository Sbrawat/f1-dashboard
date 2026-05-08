import express from 'express';
import { getCurrentWeather } from '../controllers/weatherController.js';

const router = express.Router();

// Route: GET /api/weather/current
// Desc:  Fetches current weather and track temp estimations based on lat/lon query params
router.get('/current', getCurrentWeather);

export default router;