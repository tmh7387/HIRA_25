import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ProjectStoreProvider } from './stores/projectStore';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProjectStoreProvider>
        <App />
      </ProjectStoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);