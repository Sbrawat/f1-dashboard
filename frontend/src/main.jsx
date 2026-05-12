import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Context Providers
import { SessionProvider } from './context/SessionContext.jsx';
import { WeatherProvider } from './context/WeatherContext.jsx';
import { RaceProvider } from './context/RaceContext.jsx';
import { TelemetryProvider } from './context/TelemetryContext.jsx'; // <-- NEW IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
        <SessionProvider>
            <WeatherProvider>
                <RaceProvider>
                    {/* Add the TelemetryProvider right here! */}
                    <TelemetryProvider>
                        <App />
                    </TelemetryProvider>
                </RaceProvider>
            </WeatherProvider>
        </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>
);