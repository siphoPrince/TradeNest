
import React from 'react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
            <CheckCircle size={80} color="#22c55e" className="mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Secured!</h1>
            <p className="text-gray-600 max-w-md mb-8">
                Your funds are now safely held in escrow. The seller has been notified to prepare your item.
            </p>
            
            <div className="flex gap-4">
                <Link to="/orders" className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
                    View My Orders <Package size={18} />
                </Link>
                <Link to="/" className="flex items-center gap-2 text-gray-500 px-6 py-3 font-semibold">
                    Continue Shopping <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;