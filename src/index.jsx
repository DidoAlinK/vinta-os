import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Entry point for Vinta School OS.
 * Mounts the root <App /> component into the DOM.
 */
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
