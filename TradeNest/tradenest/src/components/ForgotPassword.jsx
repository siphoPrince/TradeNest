import { useState } from "react";
import authService from "../services/authService";
import Logo from "../assets/LgoNoBg.png";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // Calls your C# AccountController ForgotPassword method
      await authService.forgotPassword(email);
      
      setIsError(false);
      setMessage("Success! If an account exists with this email, you'll receive a reset link shortly.");
    } catch (error) {
      setIsError(true);
      setMessage("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="logo-container">
          <img src={Logo} alt="Cylo Logo" className="auth-logo" />
        </div>
        
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form className="auth-form" onSubmit={handleRequestReset}>
            <div className="input-group">
              <input
                className="auth-input"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              className="auth-button" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && (
            <p className={isError ? "auth-error-message" : "auth-success-message"}>
              {message}
            </p>
          )}
          
          <div className="auth-footer">
            <Link to="/" className="auth-link">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;