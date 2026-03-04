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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Note: your authService.register expects (username, email, password)
      await authService.register(username, email, password);
      alert("Registration successful! Please login.");
      navigate("/");
    } catch (error) {
      alert("Registration failed. Try a different email or username.");
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

          <form className="auth-form" onSubmit={handleRegister}>
            {/* Added Username Input since your service likely needs it */}
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