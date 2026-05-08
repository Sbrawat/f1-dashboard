import express from 'express';
import { getNextSession } from '../controllers/sessionController.js';

const router = express.Router();

// Route: GET /api/session/next
// Desc:  Fetches the upcoming F1 session and circuit coordinates
router.get('/next', getNextSession);

export default router;