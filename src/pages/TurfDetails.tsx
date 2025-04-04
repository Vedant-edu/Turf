import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import { turfs } from '../data/turfs';
import { mockBookings } from '../data/mock';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const turf = turfs.find(t => t.id === id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);


  useEffect(() => {
    const fetchBookings = async () => {
      if (selectedDate && turf) {
        const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
        
        // Fetch booked slots from Supabase
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('turf_id', turf.id)
          .eq('booking_date', formattedDate);

        if (error) {
          console.error('Error fetching bookings:', error);
        } else {
          setBookedTimeSlots(data.map(b => b.booking_time));
        }
      }
    };

    fetchBookings();
  }, [selectedDate, turf]);

  if (!turf) {
    return <div>Turf not found</div>;
  }
  const handleBooking = async () => {
    if (selectedDate && selectedTime) {
      const bookingData = {
        user_email: userEmail,
        turf_id: turf.id,
        turf_name: turf.name,
        booking_date: format(new Date(selectedDate), 'yyyy-MM-dd'),
        booking_time: selectedTime,
        amount_paid: `₹${turf.pricePerHour}`,
      };

      // Insert booking into Supabase
      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) {
        console.error('Error inserting booking:', error);
        return;
      }

      navigate('/booking-confirmation', { state: { turf, date: new Date(selectedDate), time: selectedTime } });
      console.log("data added sucessfully");
    }
  };

  const isTimeSlotBooked = (time: string) => bookedTimeSlots.includes(time);

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
          <ChevronLeft className="w-5 h-5" />
          <span>Back to turfs</span>
        </button>

        <div className="rounded-lg overflow-hidden">
          <div className="relative h-64">
            <img src={turf.images[0]} alt={turf.name} className="w-full h-full object-cover" />
          </div>

          <div className="py-6">
            <h1 className="text-3xl font-bold mb-4">{turf.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{turf.address}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Scrollable Date Picker for Mobile */}
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {format(selectedDate ? new Date(selectedDate) : new Date(), 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-4 py-3">
                  {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map(date => {
                    const isSelected = selectedDate && format(new Date(selectedDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={format(date, 'yyyy-MM-dd')}
                        onClick={() => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                        className={`p-3 rounded-lg border min-w-[60px] flex flex-col items-center whitespace-nowrap
                          ${isSelected ? 'bg-green-600 text-white border-transparent' : 'border-gray-300 hover:border-green-600'}
                        `}
                      >
                        <span className="text-sm font-medium">{format(date, 'EEE')}</span>
                        <span className="text-lg font-semibold">{format(date, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Time</h2>
                {selectedDate ? (
                  <div className="flex flex-wrap gap-2">
                    {turf.availableTimeSlots.map(time => {
                      const isBooked = isTimeSlotBooked(time);
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          className={`py-2 rounded-lg border flex items-center justify-center gap-2 w-20
                            ${isBooked 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200' 
                              : selectedTime === time
                                ? 'bg-green-600 text-white border-transparent'
                                : 'border-gray-300 hover:border-green-600'
                            }`}
                        >
                          <Clock className="w-4 h-4" />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Please select a date first</p>
                )}
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

      {/* Hide Scrollbar on Mobile */}
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
}
