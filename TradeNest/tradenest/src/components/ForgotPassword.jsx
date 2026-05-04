import { useState } from "react";
import authService from "../services/authService";
import Logo from "../assets/LgoNoBg.png";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await authService.forgotPassword(email);
      setMessage("If an account exists, a reset link has been sent.");
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="logo-container"><img src={Logo} alt="Logo" className="auth-logo" /></div>
        <div className="auth-card">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive a reset link.</p>
          
          <form className="auth-form" onSubmit={handleRequestReset}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="auth-button" type="submit">Send Reset Link</button>
          </form>

          {message && <p className="auth-message">{message}</p>}
          
          <p className="auth-footer">
            <Link to="/" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;