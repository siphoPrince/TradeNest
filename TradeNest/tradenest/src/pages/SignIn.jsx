import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import Logo from "../assets/LgoNoBg.png";
import "../styles/signIn.css"; 

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
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