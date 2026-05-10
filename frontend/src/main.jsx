import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SessionProvider } from './context/SessionContext.jsx';
import { WeatherProvider } from './context/WeatherContext.jsx';
import { RaceProvider } from './context/RaceContext.jsx'; // NEW

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SessionProvider>
        <WeatherProvider>
            <RaceProvider>
                <App />
            </RaceProvider>
        </WeatherProvider>
    </SessionProvider>
  </React.StrictMode>
);