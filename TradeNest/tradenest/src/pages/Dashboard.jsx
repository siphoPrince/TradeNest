import Feed from "../components/Feed";
import Navigation from "../components/Navigation";
import "../styles/Dashboard.css";

function Dashboard() {
  return (
    <div className="container">
        {/* SIDEBAR */}
        <Navigation />
        {/* MAIN CONTENT */}
        <Feed/>

    </div>
  );
}

export default Dashboard;