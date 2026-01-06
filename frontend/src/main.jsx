import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ControllerProvider } from './controllers/ControllerProvider.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 2rem; font-family: sans-serif;"><h1>Error: Root element not found</h1><p>Please check if the HTML file has a div with id="root"</p></div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <ControllerProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ControllerProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; background: #F7FAFC; min-height: 100vh;">
        <h1 style="color: #E74C3C;">Error Loading Application</h1>
        <p style="color: #1A1A1A;">${error.message}</p>
        <p style="color: #4A5568;">Please check the browser console for more details.</p>
      </div>
    `;
  }
}
