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
import PaymentSuccess from "./pages/payment-success";
import PaymentHistory from "./pages/PaymentHistory";
import ForgotPassword from "./components/ForgotPassword";
import MyOrders from "./pages/MyOrders";

function App() {
  // Run this as early as possible to prevent "flashing" white on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}
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
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/history" element={<PaymentHistory />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/my-orders" element={<MyOrders/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;