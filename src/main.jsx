import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = "1051548302815-vl27r6i2jr5opjom9mlliopujk3msteb.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
