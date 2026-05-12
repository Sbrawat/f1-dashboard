import 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import our Pages
import RaceControl from './pages/RaceControl';
import RaceTimeline from './pages/RaceTimeline';
import LiveSimView from './pages/LiveSimView'; // <-- 1. Must be imported

const App = () => {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 font-sans">
      <Routes>
        {/* Redirect root to the Race Control dashboard */}
        <Route path="/" element={<Navigate to="/control" replace />} />
        
        {/* Epic 2: The Hero Module */}
        <Route path="/control" element={<RaceControl />} />
        
        {/* Epic 3: The Timeline */}
        <Route path="/timeline" element={<RaceTimeline />} />
        
        {/* Epic 3: The Live-Sim View */}
        {/* The ":id" tells the router to expect a dynamic number here (the sessionKey) */}
        <Route path="/sim/:id" element={<LiveSimView />} /> 
      </Routes>
    </div>
  );
};

export default App;