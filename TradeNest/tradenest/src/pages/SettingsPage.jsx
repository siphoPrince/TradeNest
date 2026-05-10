import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { CreditCard, ChartArea, Van , Sun, Moon ,LogOut} from 'lucide-react';
import "../styles/Settings.css";

const SettingsPage = () => {
    const navigate = useNavigate();

    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains('dark')
    );

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        // Clear all Cylo-related data from storage
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("theme"); // Optional: clear theme if you want it to reset
        
        // Send them back to login
        navigate("/SignUp");
    };

    

    return (
        <div className="settings-page">
            <Navigation />

            <div className="settings-view">
                <div className="settings-header">
                    <h2>Settings</h2>
                </div>

                <div className="settings-layout">
                    {/* Left Sidebar for Settings Navigation */}
                    <aside className="settings-sidebar">
                        <nav className="sidebar-nav">
                            <NavLink 
                                to="/account" 
                                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            >
                                <CreditCard size={20}/>
                                <span>Account details</span>
                            </NavLink>
                            <NavLink 
                                to="/my-orders" 
                                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            >
                                <Van  size={20}/>
                                <span>Orders</span>
                            </NavLink>
                            <NavLink 
                                to="/manage" 
                                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            >
                                <ChartArea size={20}/>
                                <span>Analytics</span>
                            </NavLink>
                        </nav>

                        <div className="sidebar-divider"></div>

                        {/* Theme Toggle moved to sidebar for a cleaner look */}
                        <button className="sidebar-theme-btn" onClick={toggleTheme}>
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
                        </button>

                        <button className="sidebar-logout-btn" onClick={handleLogout}>
                            <LogOut size={20} color="#ff4d4d" />
                            <span style={{ color: '#ff4d4d' }}>Logout</span>
                        </button>
                        
                        
                    </aside>

                    
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;