import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/styles/globals.css';

console.log('Starting application...');
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Root element:', document.getElementById('root'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Creating root element...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('Root element rendered');
