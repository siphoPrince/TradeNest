import React, { useState } from 'react';
import axios from 'axios';

const SellerSetup = () => {
    const [bankData, setBankData] = useState({
        accountNumber: '',
        bankCode: '',
        bankName: '',
        idNumber: '' // Required for SA KYC
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            await axios.post('https://localhost:7124/api/Escrow/link-bank', bankData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Bank linked! You can now receive payments.");
        } catch (err) {
            console.error(err.response?.data);
            alert("Failed to link bank. Check console for details.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded">
            <h3>Link Your Bank (TradeSafe KYC)</h3>
            <input type="text" placeholder="Account Number" onChange={e => setBankData({...bankData, accountNumber: e.target.value})} />
            <input type="text" placeholder="Bank Name (e.g. FNB)" onChange={e => setBankData({...bankData, bankName: e.target.value})} />
            <input type="text" placeholder="Branch Code" onChange={e => setBankData({...bankData, bankCode: e.target.value})} />
            <input type="text" placeholder="SA ID Number" onChange={e => setBankData({...bankData, idNumber: e.target.value})} />
            <button type="submit">Complete Setup</button>
        </form>
    );
};

export default SellerSetup