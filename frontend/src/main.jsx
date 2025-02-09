import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import React from 'react'
import { ProfileProvider } from './context/ProfileContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ProfileProvider>
          
          <Routes>
            <Route path='/*' element={<App />} />
          </Routes> 
                   
        </ProfileProvider>
      </AuthProvider>  
    </Router>
    
  </StrictMode>,
)
