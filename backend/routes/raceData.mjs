import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';
import { parseISO, isAfter } from 'date-fns';

const router = express.Router();
const myCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const OPENWEATHER_API_KEY = process.env.WEATHER_API_KEY;

router.get('/next-session', async (req, res) => {
  try {
    // 1. Check Cache first
    const cachedData = myCache.get("nextSessionData");
    if (cachedData) return res.json(cachedData);

    // 2. Fetch Sessions from OpenF1
    // We filter for upcoming sessions starting from 'now'
    const sessionRes = await axios.get('https://api.openf1.org/v1/sessions');
    const now = new Date();
    
    // Find the first session where start_date is in the future
    const nextSession = sessionRes.data
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      .find(s => isAfter(parseISO(s.date_start), now));

    if (!nextSession) throw new Error("No upcoming sessions found");

    // 3. Fetch Weather for the Circuit
    // For this example, we'll map circuit_key to coordinates (or fetch from a circuit DB)
    // Example: Silverstone (circuit_key 2)
    const lat = 52.0786; 
    const lon = -1.0169;

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    const result = {
      sessionName: nextSession.session_name,
      circuitName: nextSession.circuit_short_name,
      startTime: nextSession.date_start,
      weather: {
        airTemp: weatherRes.data.main.temp,
        humidity: weatherRes.data.main.humidity,
        condition: weatherRes.data.weather[0].main,
        trackTemp: Math.round(weatherRes.data.main.temp * 1.2) // Simulated Track Temp logic
      }
    };

    // 4. Save to Cache and Send
    myCache.set("nextSessionData", result);
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;