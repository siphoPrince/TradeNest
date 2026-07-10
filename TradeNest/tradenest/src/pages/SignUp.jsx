import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import Logo from "../assets/LgoNoBg.png";
import "../styles/signIn.css"; 

function SignUp() {
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const validateForm = () => {
    setMessage("");
    setIsError(false); // Reset error state on new validation run

    // 1. Email Regex: Checks for something@somewhere.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email.trim())) {
      setIsError(true);
      setMessage("Please enter a valid email address.");
      return false;
    }

    // 2. Password Strength: Minimum 6 characters
    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Trim inputs before passing them to the service layer
      await authService.register(username.trim(), email.trim(), password);
      
      setIsError(false);
      setMessage("Registration successful! Redirecting to login...");

      // Delay navigation slightly so the user can actually see the success message
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      setIsError(true);
      
      // Captures the precise reason sent back from C# via your updated authService
      const detailedError = error.message || "Registration failed. Please check your connection.";
      setMessage(detailedError);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="auth-logo" />
        </div>
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>

          {message && (
            <p 
              className={isError ? "auth-error-message" : "auth-success-message"} 
              style={{ 
                color: isError ? '#e53e3e' : '#38a169', 
                textAlign: 'center', 
                marginBottom: '15px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {message}
            </p>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <input
              className="auth-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              className="auth-input"
              type="email"
              placeholder="Email Address"
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
              Register
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/" className="auth-link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;