import React, { useState } from 'react';
import axios from 'axios';
import '../styles/SellerSetup.css';

const SellerSetup = () => {
    const [loading, setLoading] = useState(false);
    const [bankData, setBankData] = useState({
        accountNumber: '',
        bankCode: '',
        bankName: '',
        idNumber: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post('https://localhost:7124/api/Escrow/link-bank', bankData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Verification details submitted!");
        } catch (err) {
            console.error(err);
            alert("Submission failed. Check your ID and Bank details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-page-wrapper">
            <div className="setup-card">
                <header className="setup-header">
                    <h3>Seller Verification</h3>
                    <p>Provide your banking details to enable secure escrow payments via TradeSafe.</p>
                </header>

                <form onSubmit={handleSubmit} className="form-layout">
                    <input 
                        type="text" 
                        placeholder="South African ID Number" 
                        className="input-field"
                        required
                        onChange={e => setBankData({...bankData, idNumber: e.target.value})} 
                    />

                    <input 
                        type="text" 
                        placeholder="Bank Name (e.g. Nedbank)" 
                        className="input-field"
                        required
                        onChange={e => setBankData({...bankData, bankName: e.target.value})} 
                    />

                    <div className="grid-row">
                        <input 
                            type="text" 
                            placeholder="Account Number" 
                            className="input-field"
                            required
                            onChange={e => setBankData({...bankData, accountNumber: e.target.value})} 
                        />
                        <input 
                            type="text" 
                            placeholder="Branch Code" 
                            className="input-field"
                            required
                            onChange={e => setBankData({...bankData, bankCode: e.target.value})} 
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Link Bank Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerSetup;