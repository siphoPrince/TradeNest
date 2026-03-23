import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Upload from "./pages/Upload";
import Inbox from "./pages/Inbox";
import BuyNow from "./pages/BuyNow";
import EditProfile from "./pages/EditProfile";
import SellerSetup from "./pages/SellerSetup";
import ManageListings from "./pages/ManageListings";
import EditListing from "./pages/EditListing";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/buyNow" element={<BuyNow />} />
        <Route path="/Manage" element={<ManageListings />} />
        <Route path="/edit-post/:id" element={<EditListing />} />
        <Route path="/account" element={<SellerSetup />} />
        <Route path="/buyNow/:id" element={<BuyNow />} />
        <Route path="/editProfile" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;