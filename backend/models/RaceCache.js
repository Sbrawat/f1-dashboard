import mongoose from 'mongoose';

const raceCacheSchema = new mongoose.Schema({
    sessionKey: {
        type: Number,
        required: true,
        unique: true, // Ensures we don't save duplicate results for the same race
        index: true   // Speeds up query times
    },
    raceName: {
        type: String,
    },
    year: {
        type: Number,
    },
    results: [{
        position: Number,
        driver_number: Number,
        name_acronym: String, // e.g., "VER", "HAM"
        team_name: String,
        time_penalty: Number
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true 
});

const RaceCache = mongoose.model('RaceCache', raceCacheSchema);

export default RaceCache;