import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Logo from "../assets/LgoNoBg.png";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // We only need the token now, as the backend finds the user via this unique token
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      // Sending only the token and newPassword to match ResetPasswordDto
      await authService.resetPassword({
        token,
        newPassword
      });
      
      setIsError(false);
      setMessage("Success! Your password has been updated. Redirecting to login...");
      
      // Give the user time to read the success message
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setIsError(true);
      setMessage("Invalid or expired link. Please request a new reset email.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="logo-container">
          <img src={Logo} alt="Cylo Logo" className="auth-logo" />
        </div>
        <div className="auth-card">
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">Enter your new security credentials below.</p>
          
          <form className="auth-form" onSubmit={handleReset}>
            <input
              className="auth-input"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button className="auth-button" type="submit">Update Password</button>
          </form>
          
          {message && (
            <p className={isError ? "auth-error-message" : "auth-success-message"}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;