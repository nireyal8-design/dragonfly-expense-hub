import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/globals.css';

console.log('Starting application...');
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Environment:', import.meta.env.MODE);

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
