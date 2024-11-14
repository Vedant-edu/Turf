import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface PincodeModalProps {
  onSubmit: (pincode: string) => void;
}

export default function PincodeModal({ onSubmit }: PincodeModalProps) {
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    onSubmit(pincode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <MapPin className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to TurfBook</h2>
        <p className="text-gray-600 text-center mb-6">
          Please enter your pincode to find turfs near you
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your pincode"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Find Turfs
          </button>
        </form>
      </div>
    </div>
  );
}