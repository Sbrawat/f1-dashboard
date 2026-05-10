import 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import our Pages
import RaceControl from './pages/RaceControl';
import RaceTimeline from './pages/RaceTimeline';
// We haven't built this yet, but we will next!
import LiveSimView from './pages/LiveSimView'; 

const App = () => {
  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Optional: Add a simple persistent Navbar here if you want */}
      
      <Routes>
        {/* Redirect root to the Hero Module */}
        <Route path="/" element={<Navigate to="/control" replace />} />
        
        {/* Epic 2: The Hero Module */}
        <Route path="/control" element={<RaceControl />} />
        
        {/* Epic 3: The Timeline */}
        <Route path="/timeline" element={<RaceTimeline />} />
        
        {/* Epic 3: The Live-Sim View (The :id is the sessionKey) */}
        <Route path="/sim/:id" element={<LiveSimView />} />
      </Routes>
    </div>
  );
};

export default App;