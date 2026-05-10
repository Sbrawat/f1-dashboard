import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // NEW IMPORT
import App from './App.jsx';
import './index.css';

import { SessionProvider } from './context/SessionContext.jsx';
import { WeatherProvider } from './context/WeatherContext.jsx';
import { RaceProvider } from './context/RaceContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap everything in BrowserRouter */}
    <BrowserRouter> 
        <SessionProvider>
            <WeatherProvider>
                <RaceProvider>
                    <App />
                </RaceProvider>
            </WeatherProvider>
        </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>
);