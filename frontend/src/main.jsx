import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import { AuthProvider } from './context/AuthProvider.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import App from './App.jsx'

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
