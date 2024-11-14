import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Turf } from '../types';

interface BookingConfirmationProps {
  turf: Turf;
  date: Date;
  time: string;
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { turf, date, time } = location.state as BookingConfirmationProps;

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF ticket
    alert('Downloading ticket...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="text-gray-600 mt-2">Your turf has been successfully booked</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Ticket Header */}
          <div className="bg-green-600 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">{turf.name}</h2>
            <p className="text-green-100 text-sm flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {turf.address}
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold">{time}</p>
                </div>
              </div>
            </div>

            <div className="py-4 border-b">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold">1 hour</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold">₹{turf.pricePerHour}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Ticket
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Book Another Turf
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}