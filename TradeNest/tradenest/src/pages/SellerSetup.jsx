import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, User, Mail, Phone, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import "../styles/SellerSetup.css";

const SellerSetup = ({ onComplete }) => {
    // 1. State Management
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    
    const [userData, setUserData] = useState({
        accountName: '', 
        email: '',
        mobileNumber: '', 
    });

    // 2. Load User Context
    useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail') || ""; 
        setUserData(prev => ({ ...prev, email: savedEmail }));
    }, []);

    // 3. The Onboarding Call (Fixed to include Request Body)
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Create the payload
    const payload = {
        name: userData.accountName.trim(),
        mobile: userData.mobileNumber.trim(),
        email: userData.email.trim()
    };

    console.log("Sending Onboarding Payload:", payload); // CHECK THIS IN CONSOLE

    try {
        const userId = localStorage.getItem('userId');
        const response = await axios.post(
            `https://cylosocials.co.za/api/Payments/onboard/${userId}`, 
            payload
        );
        
        setSuccess(true);
        setTimeout(() => {
            if (onComplete) onComplete(response.data.tradeSafeId);
        }, 2500);

    } catch (err) {
        console.error("Onboarding Error:", err.response?.data); // See the specific error from the server
        setError(err.response?.data?.message || "Verification failed. Check formats.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="setup-layout-container">
            <Navigation />
            <div className="setup-page-wrapper">
                <div className="setup-card">
                    {/* Success View */}
                    {success ? (
                        <div className="status-view success">
                            <div className="success-icon-wrapper">
                                <CheckCircle2 size={48} color="#22c55e" />
                            </div>
                            <h3>Account Secured!</h3>
                            <p>Your Cylo profile is now linked to TradeSafe Escrow.</p>
                            <div className="loading-bar-container">
                                <div className="loading-bar-fill"></div>
                            </div>
                        </div>
                    ) : (
                        /* Form View */
                        <>
                            <header className="setup-header">
                                <div className="icon-badge">
                                    <ShieldCheck color="#22c55e" size={32} />
                                </div>
                                <h3>Activate Payments</h3>
                                <p>Link your account to our secure escrow partner to start trading.</p>
                            </header>

                            {error && (
                                <div className="error-banner">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="form-layout">
                                <div className="input-group">
                                    <label><User size={14} /> Full Legal Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="input-field" 
                                        placeholder="John Doe"
                                        value={userData.accountName}
                                        onChange={e => setUserData({...userData, accountName: e.target.value})} 
                                    />
                                </div>

                                <div className="input-group">
                                    <label><Mail size={14} /> Email Address</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="input-field" 
                                        placeholder="yourname@example.com"
                                        value={userData.email} 
                                        onChange={e => setUserData({...userData, email: e.target.value})}
                                    />
                                    <small>Email is verified during registration</small>
                                </div>

                                <div className="input-group">
                                    <label><Phone size={14} /> Mobile Number</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="082 123 4567" 
                                        className="input-field" 
                                        value={userData.mobileNumber}
                                        onChange={e => setUserData({...userData, mobileNumber: e.target.value})} 
                                    />
                                </div>

                                <div className="info-box">
                                    <p>Cylo uses <strong>TradeSafe Escrow</strong> to protect your money. Funds are only released when both parties are happy.</p>
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Connecting...' : 'Secure My Account'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerSetup;