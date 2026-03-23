import { NavLink, Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { CreditCard, ChartArea, Pencil   } from 'lucide-react';
import "../styles/Settings.css";

const SettingsPage = () => {
  return (
    <div className="settings-page">
      {/* Sidebar Navigation (Left) */}
      <Navigation />

      {/* Main Content Area (Right) */}
      <div className="settings-view">
        
        <div className="settings-header">
          <h2>Settings</h2>
        </div>

        {/* Tab Navigation (Pill-style) */}
        <nav className="settings-tabs">
          <NavLink 
            to="/account" 
            className={({ isActive }) => isActive ? "tab-link active" : "tab-link"}
          >
          Account <CreditCard/>
          </NavLink>
          <NavLink 
            to="/edit" 
            className={({ isActive }) => isActive ? "tab-link active" : "tab-link"}
          >
            Edit Profile<Pencil />
          </NavLink>
          <NavLink 
            to="/manage" 
            className={({ isActive }) => isActive ? "tab-link active" : "tab-link"}
          >
            Analytics<ChartArea />
          </NavLink>
        </nav>

        {/* Dynamic Section Content */}
        <section className="settings-display">
          <Outlet />
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;