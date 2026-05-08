import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SessionProvider } from './context/SessionContext.jsx';
import { WeatherProvider } from './context/WeatherContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SessionProvider>
        <WeatherProvider>
            <App />
        </WeatherProvider>
    </SessionProvider>
  </React.StrictMode>
);