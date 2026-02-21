

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';

import './index.css'
// AG Grid styles - required
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
