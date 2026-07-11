import React, { useState } from 'react';
import { escrowService } from '../../services/api';

const OnboardingForm = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        accountNumber: '',
        bankCode: '',
        bankName: '',
        accountName: '',
        idNumber: '',
        email: '',
        mobileNumber: '',
        accountType: 'SAVINGS' // Default
    });

    const [files, setFiles] = useState({
        idDocument: null,
        proofOfAddress: null
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        // Append text fields
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        // Append files
        data.append('idDocument', files.idDocument);
        data.append('proofOfAddress', files.proofOfAddress);

        try {
            const result = await escrowService.onboardSeller(data);
            if (result.success) {
                alert("FICA Onboarding Submitted Successfully!");
            }
        } catch (error) {
            console.error("Onboarding failed", error);
            alert(error.response?.data?.message || "Check console for errors");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Seller Payout Verification (FICA)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="accountName" placeholder="Account Holder Name" onChange={handleInputChange} required className="border p-2" />
                <input name="accountNumber" placeholder="Account Number" onChange={handleInputChange} required className="border p-2" />
                <input name="bankName" placeholder="Bank Name (e.g. Capitec)" onChange={handleInputChange} required className="border p-2" />
                <input name="bankCode" placeholder="Branch Code" onChange={handleInputChange} required className="border p-2" />
                <input name="idNumber" placeholder="SA ID Number" maxLength="13" onChange={handleInputChange} required className="border p-2" />
                <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="border p-2" />
                <input name="mobileNumber" placeholder="Mobile Number" onChange={handleInputChange} required className="border p-2" />
                
                <select name="accountType" onChange={handleInputChange} className="border p-2">
                    <option value="SAVINGS">Savings</option>
                    <option value="CURRENT">Current/Cheque</option>
                </select>

                <div>
                    <label className="block text-sm">ID Document (Image/PDF)</label>
                    <input type="file" name="idDocument" onChange={handleFileChange} required className="border p-2 w-full" />
                </div>

                <div>
                    <label className="block text-sm">Proof of Address</label>
                    <input type="file" name="proofOfAddress" onChange={handleFileChange} required className="border p-2 w-full" />
                </div>
            </div>

            <button type="submit" disabled={loading} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">
                {loading ? "Processing..." : "Submit for Verification"}
            </button>
        </form>
    );
};

export default OnboardingForm;