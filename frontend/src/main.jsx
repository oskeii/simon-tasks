import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import React from 'react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
      
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      
      </AuthProvider>  
    </Router>
    
  </StrictMode>,
)
