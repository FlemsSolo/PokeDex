import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('MyRoot')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
