import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Landmark, CreditCard, Fingerprint, User, FileText, Phone, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import "../styles/SellerSetup.css";
const SOUTH_AFRICAN_BANKS = [
    { name: "First National Bank (FNB)", code: "250655" },
    { name: "Standard Bank", code: "051001" },
    { name: "Capitec Bank", code: "470010" },
    { name: "Absa Bank", code: "632005" },
    { name: "Nedbank", code: "198765" },
    { name: "African Bank", code: "430000" },
    { name: "TymeBank", code: "678910" }
];

const SellerSetup = ({ onComplete }) => {
    const [loading, setLoading] = useState(false);
    
    // Bank and Contact State
    const [bankData, setBankData] = useState({
        accountNumber: '',
        bankCode: '',
        bankName: '',
        accountType: 'Current',
        idNumber: '',
        accountName: '',
        mobileNumber: '', // Added for TradeSafe requirements
        email: ''         // Added for TradeSafe requirements
    });
    
    // File States
    const [idFile, setIdFile] = useState(null);
    const [poaFile, setPoaFile] = useState(null);

    // Mock: Pull user email from local storage or auth context on mount
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
        
        if (!idFile || !poaFile) {
            alert("Please upload both your ID and Proof of Address.");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        // FormData matches the updated BankDetailsDTO.cs exactly
        const formData = new FormData();
        formData.append('AccountNumber', bankData.accountNumber);
        formData.append('BankCode', bankData.bankCode);
        formData.append('BankName', bankData.bankName);
        formData.append('AccountName', bankData.accountName);
        formData.append('IdNumber', bankData.idNumber);
        formData.append('Email', bankData.email);
        formData.append('MobileNumber', bankData.mobileNumber);
        formData.append('AccountType', bankData.accountType);
        
        // Files
        formData.append('IdDocument', idFile);
        formData.append('ProofOfAddress', poaFile);

        try {
            await axios.post('https://localhost:7124/api/Escrow/onboard-seller', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            alert("FICA & Bank details submitted successfully!");
            if (onComplete) onComplete(); 
        } catch (err) {
            console.error("Setup Error:", err);
            // This captures the 'TradeSafe GraphQL Error' we added in C#
            const errorMessage = err.response?.data?.message || "Verification failed. Check your details.";
            alert(errorMessage);
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

                    <form onSubmit={handleSubmit} className="form-layout">
                        
                        {/* Personal/Contact Info */}
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
                                <input type="text" required placeholder="e.g. 27821234567" className="input-field" value={bankData.mobileNumber}
                                    onChange={e => setBankData({...bankData, mobileNumber: e.target.value})} />
                            </div>
                        </div>

                        <hr className="form-divider" />

                        {/* Bank Details */}
                        <div className="input-group">
                            <label><Landmark size={16} /> Select Bank</label>
                            <select className="input-field" required value={bankData.bankName} onChange={handleBankChange}>
                                <option value="">-- Choose --</option>
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
                                    <option value="Current">Current/Cheque</option>
                                    <option value="Savings">Savings</option>
                                </select>
                            </div>
                        </div>

                        {/* Document Uploads */}
                        <div className="document-upload-section">
                            <div className="input-group">
                                <label><FileText size={16} /> ID Document (PDF/JPG)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" required 
                                    onChange={e => setIdFile(e.target.files[0])} />
                            </div>
                            
                            <div className="input-group">
                                <label><FileText size={16} /> Proof of Address</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" required 
                                    onChange={e => setPoaFile(e.target.files[0])} />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing Documents...' : 'Complete Verification'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerSetup;