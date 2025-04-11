import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface PincodePageProps {
  onSubmit: (pincode: string) => void;
}

export default function PincodePage({ onSubmit }: PincodePageProps) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <MapPin className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pincode Please?</h1>
          {/* <p className="text-lg text-gray-600">
            Turfer - Find and book the perfect turf near you
          </p> */}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="pincode"
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Enter 6-digit pincode"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
            >
              Find Turfs Near Me
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          We use your pincode to show you the best turfs in your area
        </p>
      </div>
    </div>
  );
}