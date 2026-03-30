import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { CreditCard, ChartArea, Pencil, Sun, Moon } from 'lucide-react';
import "../styles/Settings.css";

const SettingsPage = () => {
  // Initialize state based on whether the 'dark' class is already present
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

  return (
    <div className="settings-page">
      <Navigation />

      <div className="settings-view">
        <div className="settings-header">
          <h2>Settings</h2>
          
          {/* Using your .btn and .btn-outline classes from the CSS provided */}
          <button className="btn btn-outline" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={18} style={{marginRight: '8px'}}/> : <Moon size={18} style={{marginRight: '8px'}}/>}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <nav className="settings-tabs">
          <NavLink 
            to="/account" 
            className={({ isActive }) => isActive ? "tab-link active" : "tab-link"}
          >
            Account <CreditCard size={18}/>
          </NavLink>
          <NavLink 
            to="/edit" 
            className={({ isActive }) => isActive ? "tab-link active" : "tab-link"}
          >
            Edit Profile <Pencil size={18}/>
          </NavLink>
          <NavLink 
            to="/manage" 
            className={({ isActive }) => isActive ? "tab-link active" : "tab-link"}
          >
            Analytics <ChartArea size={18}/>
          </NavLink>
        </nav>

        <section className="settings-display">
          {/* These children will now automatically inherit the dark/light variables */}
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;