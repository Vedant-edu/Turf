import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import { turfs } from '../data/turfs';
import 'react-day-picker/dist/style.css';

export default function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const turf = turfs.find(t => t.id === id);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  if (!turf) {
    return <div>Turf not found</div>;
  }

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      navigate('/booking-confirmation', {
        state: {
          turf,
          date: selectedDate,
          time: selectedTime
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to turfs</span>
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64">
            <img
              src={turf.images[0]}
              alt={turf.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{turf.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{turf.address}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Date</h2>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  fromDate={new Date()}
                  className="border rounded-lg p-3"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Select Time</h2>
                <div className="grid grid-cols-3 gap-2">
                  {turf.availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border flex items-center justify-center gap-2
                        ${selectedTime === time
                          ? 'bg-green-600 text-white border-transparent'
                          : 'border-gray-300 hover:border-green-600'
                        }`}
                    >
                      <Clock className="w-4 h-4" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600">Price per hour</p>
                  <p className="text-2xl font-bold">₹{turf.pricePerHour}</p>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime}
                  className={`px-6 py-3 rounded-lg text-white font-medium
                    ${selectedDate && selectedTime
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}