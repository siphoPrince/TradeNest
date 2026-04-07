import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Landmark, CreditCard, Fingerprint, User, FileText, Phone, Mail, AlertCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import "../styles/SellerSetup.css";

// Updated to use TradeSafe String Identifiers
const SOUTH_AFRICAN_BANKS = [
    { name: "First National Bank (FNB)", code: "FNB" },
    { name: "Standard Bank", code: "SBSA" },
    { name: "Capitec Bank", code: "CAP" },
    { name: "Absa Bank", code: "ABSA" },
    { name: "Nedbank", code: "NED" },
    { name: "African Bank", code: "AFB" },
    { name: "TymeBank", code: "TYME" },
    { name: "Bank Zero", code: "BZERO" }
];

const SellerSetup = ({ onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [bankData, setBankData] = useState({
        accountNumber: '',
        bankCode: '',
        bankName: '',
        accountType: 'CHEQUE', // Default to TradeSafe 'CHEQUE'
        idNumber: '',
        accountName: '',
        mobileNumber: '', 
        email: ''         
    });
    
    const [idFile, setIdFile] = useState(null);
    const [poaFile, setPoaFile] = useState(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail') || ""; 
        setBankData(prev => ({ ...prev, email: savedEmail }));
    }, []);

    const handleBankChange = (e) => {
        const selectedBank = SOUTH_AFRICAN_BANKS.find(b => b.name === e.target.value);
        setBankData({
            ...bankData, 
            bankName: e.target.value, 
            bankCode: selectedBank ? selectedBank.code : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        
        if (!idFile || !poaFile) {
            setError("Please upload both your ID and Proof of Address.");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        // FormData matches the updated BankDetailsDTO.cs exactly
        const formData = new FormData();
        formData.append('AccountNumber', bankData.accountNumber);
        formData.append('BankCode', bankData.bankCode); // e.g. "FNB"
        formData.append('BankName', bankData.bankName);
        formData.append('AccountName', bankData.accountName);
        formData.append('IdNumber', bankData.idNumber);
        formData.append('Email', bankData.email);
        formData.append('MobileNumber', bankData.mobileNumber);
        formData.append('AccountType', bankData.accountType); // "CHEQUE" or "SAVINGS"
        
        formData.append('IdDocument', idFile);
        formData.append('ProofOfAddress', poaFile);

        try {
            await axios.post('https://localhost:7124/api/Escrow/onboard-seller', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            // On success, we can use a simpler alert or move to a success state
            alert("FICA & Bank details submitted successfully!");
            if (onComplete) onComplete(); 
        } catch (err) {
            console.error("Setup Error:", err);
            const msg = err.response?.data?.message || "Verification failed. Please double-check your bank details and ID.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-layout-container">
            <Navigation />
            <div className="setup-page-wrapper">
                <div className="setup-card">
                    <header className="setup-header">
                        <div className="icon-badge">
                            <ShieldCheck color="#22c55e" size={32} />
                        </div>
                        <h3>Seller Verification (FICA)</h3>
                        <p>Verify your identity to enable secure payouts on Cylo.</p>
                    </header>

                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-layout">
                        
                        <div className="grid-row">
                            <div className="input-group">
                                <label><User size={16} /> Account Holder Name</label>
                                <input type="text" required className="input-field" value={bankData.accountName}
                                    onChange={e => setBankData({...bankData, accountName: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label><Fingerprint size={16} /> SA ID Number</label>
                                <input type="text" required maxLength="13" className="input-field" value={bankData.idNumber}
                                    onChange={e => setBankData({...bankData, idNumber: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid-row">
                            <div className="input-group">
                                <label><Mail size={16} /> Email Address</label>
                                <input type="email" required className="input-field" value={bankData.email}
                                    onChange={e => setBankData({...bankData, email: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label><Phone size={16} /> Mobile Number</label>
                                <input type="text" required placeholder="e.g. 082 123 4567" className="input-field" value={bankData.mobileNumber}
                                    onChange={e => setBankData({...bankData, mobileNumber: e.target.value})} />
                            </div>
                        </div>

                        <hr className="form-divider" />

                        <div className="input-group">
                            <label><Landmark size={16} /> Select Bank</label>
                            <select className="input-field" required value={bankData.bankName} onChange={handleBankChange}>
                                <option value="">-- Choose Your Bank --</option>
                                {SOUTH_AFRICAN_BANKS.map(bank => <option key={bank.code} value={bank.name}>{bank.name}</option>)}
                            </select>
                        </div>

                        <div className="grid-row">
                            <div className="input-group">
                                <label><CreditCard size={16} /> Account Number</label>
                                <input type="text" required className="input-field" value={bankData.accountNumber}
                                    onChange={e => setBankData({...bankData, accountNumber: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>Account Type</label>
                                <select className="input-field" value={bankData.accountType} 
                                    onChange={e => setBankData({...bankData, accountType: e.target.value})}>
                                    <option value="CHEQUE">Current/Cheque</option>
                                    <option value="SAVINGS">Savings</option>
                                </select>
                            </div>
                        </div>

                        <div className="document-upload-section">
                            <div className="file-input-wrapper">
                                <label><FileText size={16} /> ID Document (PDF/JPG)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" required 
                                    onChange={e => setIdFile(e.target.files[0])} />
                                {idFile && <span className="file-name">✓ {idFile.name}</span>}
                            </div>
                            
                            <div className="file-input-wrapper">
                                <label><FileText size={16} /> Proof of Address</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" required 
                                    onChange={e => setPoaFile(e.target.files[0])} />
                                {poaFile && <span className="file-name">✓ {poaFile.name}</span>}
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Securing your account...' : 'Complete Verification'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerSetup;