import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import Logo from "../assets/LgoNoBg.png";
import { GoogleLogin } from '@react-oauth/google';
import "../styles/signIn.css"; 

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); 
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validateForm()) return;
    try {
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", response.userId);
      
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  const validateForm = () => {
  // 1. Email Regex: Checks for something@somewhere.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    setMessage("Please enter a valid email address.");
    return false;
  }

  // 2. Password Strength: Minimum 6 characters
  if (password.length < 6) {
    setMessage("Password must be at least 6 characters long.");
    return false;
  }

  return true;
};

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const response = await authService.googleLogin(credentialResponse.credential);
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.userId);
        navigate("/dashboard");
    } catch (error) {
        alert("Google Sign-In failed.");
    }
};

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="auth-logo" />
        </div>
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          {message && <p className="auth-error-msg" style={{ color: '#ff4444', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>{message}</p>}
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="auth-button" type="submit">
              Sign In
            </button>
          </form>

          <div className="forgot-link-container">
            <Link to="/forgot-password" size="small" className="auth-link-secondary">
              Forgot Password?
            </Link>
          </div>

          {/* Added a divider and the Google Button */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="google-btn-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Login Failed")}
              useOneTap
              theme="filled_blue"
              shape="pill"
            />
          </div>

          <p className="auth-footer">
            Don’t have an account?{" "}
            <Link to="/SignUp" className="auth-link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;