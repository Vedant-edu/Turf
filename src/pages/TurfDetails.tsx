import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { ChevronLeft, MapPin, Clock, Star, Calendar, Info } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch turf details from Supabase
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('turf_data')
          .select('*')
          .eq('turf_id_new', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          // Ensure availableTimeSlots is an array
          if (typeof data.availableTimeSlots === 'string') {
            data.availableTimeSlots = JSON.parse(data.availableTimeSlots);
          } else if (!Array.isArray(data.availableTimeSlots)) {
            data.availableTimeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
          }
          
          // Ensure images is an array
          if (typeof data.images === 'string') {
            data.images = JSON.parse(data.images);
          } else if (!Array.isArray(data.images)) {
            data.images = ['https://via.placeholder.com/800x400?text=Turf+Image'];
          }
          
          setTurf(data);
        } else {
          setError('Turf not found');
        }
      } catch (err) {
        console.error('Error fetching turf:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurfDetails();
  }, [id]);

  // Fetch booked time slots when date is selected
  useEffect(() => {
    const fetchBookings = async () => {
      if (selectedDate && turf) {
        setIsLoading(true);
        const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('turf_id_new', turf.turf_id_new)
          .eq('booking_date', formattedDate);

        if (error) {
          console.error('Error fetching bookings:', error);
        } else {
          setBookedTimeSlots(data.map(b => b.booking_time));
        }
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate, turf]);

  const handleBooking = async () => {
    if (selectedDate && selectedTime && turf) {
      setIsLoading(true);
      const bookingData = {
        user_email: userEmail,
        turf_id_new: turf.turf_id_new,
        turf_name: turf.name,
        booking_date: format(new Date(selectedDate), 'yyyy-MM-dd'),
        booking_time: selectedTime,
        amount_paid: `₹${turf.pricePerHour}`,
      };

      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) {
        console.error('Error inserting booking:', error);
        setIsLoading(false);
        return;
      }

      navigate('/booking-confirmation', { 
        state: { turf, date: new Date(selectedDate), time: selectedTime } 
      });
    }
  };

  const isTimeSlotBooked = (time: string) => bookedTimeSlots.includes(time);

  if (isLoading && !turf) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading turf details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Turf</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Available Turfs
          </button>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Turf Not Found</h2>
          <p className="text-gray-600 mb-6">The turf you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Available Turfs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with back button and turf image */}
      <div className="relative">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
          <span className="sr-only">Back</span>
        </button>
        
        <div className="h-48 mb-10 w-full overflow-hidden">
          <motion.img 
            src={turf.images[0]} 
            alt={turf.name} 
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto pb-24 -mt-8">
        <motion.div 
          className="bg-white overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {/* Turf info section */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{turf.name}</h1>
                <div className="flex items-center text-gray-600 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{turf.rating || '4.5'} • {turf.reviews_count || '10'} reviews</span>
                </div>
              </div>
              <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xl font-medium">
                ₹{turf.pricePerHour}/hour
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">{turf.address}</span>
            </div>

            <p className="text-gray-700 mb-6">{turf.description || 'Premium quality turf with excellent facilities'}</p>

            {/* Facilities chips */}
            <div className="flex flex-wrap gap-2">
              {turf.facilities && turf.facilities.split(',').map((facility, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {facility.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Booking section */}
          <div className="border-t border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Book Your Slot
            </h2>

            {/* Date selection */}
            <div className="mb-8">
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map(date => {
                  const isSelected = selectedDate && format(new Date(selectedDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  return (
                    <motion.button
                      key={format(date, 'yyyy-MM-dd')}
                      onClick={() => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg border min-w-[70px] flex flex-col items-center flex-shrink-0
                        ${isSelected ? 'bg-green-600 text-white border-transparent' : 'border-gray-200 hover:border-green-400 bg-white'}
                      `}
                    >
                      <span className="text-xs font-medium">{format(date, 'EEE')}</span>
                      <span className="text-lg font-semibold">{format(date, 'd')}</span>
                      <span className="text-xs mt-1">{format(date, 'MMM')}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Time selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Available Time Slots</h3>
                {isLoading && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading availability...
                  </span>
                )}
              </div>

              {selectedDate ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {turf.availableTimeSlots.map(time => {
                    const isBooked = isTimeSlotBooked(time);
                    return (
                      <motion.button
                        key={time}
                        onClick={() => !isBooked && setSelectedTime(time)}
                        disabled={isBooked}
                        whileHover={{ scale: !isBooked ? 1.05 : 1 }}
                        whileTap={{ scale: !isBooked ? 0.95 : 1 }}
                        className={`py-3 rounded-lg border flex items-center justify-center gap-1
                          ${isBooked 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                            : selectedTime === time
                              ? 'bg-green-600 text-white border-transparent shadow-md'
                              : 'border-gray-200 hover:border-green-400 bg-white'
                          }`}
                      >
                        <Clock className={`w-4 h-4 ${selectedTime === time ? 'text-white' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{time}</span>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">Please select a date to see available time slots</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky booking footer */}
      <AnimatePresence>
        {(selectedDate && selectedTime) && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price per hour</p>
                <p className="text-xl font-bold text-gray-900">₹{turf.pricePerHour}</p>
              </div>
              <motion.button
                onClick={handleBooking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="px-8 py-3 rounded-lg bg-green-600 text-white font-medium shadow-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar hide */}
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