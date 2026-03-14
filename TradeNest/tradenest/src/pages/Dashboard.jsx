import Feed from "../components/Feed";
import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import "../styles/Dashboard.css";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000); // 3 seconds for demo
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container">
        {/* SIDEBAR */}
        <Navigation />
        {/* MAIN CONTENT */}
        <Feed isLoading={isLoading}/>

    </div>
  );
}

export default Dashboard;