import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, ArrowUp, ArrowDown, User, Clock, Hash, Edit, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isBefore, isAfter } from 'date-fns';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Booking {
  booking_id: number;
  user_email: string;
  booking_date: string;
  booking_time: string;
  turf_id_new: number;
}

interface Turf {
  turf_id_new: number;
  name: string;
  address: string;
  images: string[];
  pricePerHour: number;
  email: string;
  availableTimeSlots: string[];
}

const TurfOwner: React.FC = () => {
  const location = useLocation();
  const userEmail = location.state?.email || 'Unknown';
  const [turfId, setTurfId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [turfDetails, setTurfDetails] = useState<Turf | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Form states
  const [editForm, setEditForm] = useState({
    address: '',
    images: '',
    pricePerHour: '',
    availableTimeSlots: ''
  });
  
  const [manualEntryForm, setManualEntryForm] = useState({
    user_email: '',
    booking_date: '',
    booking_time: ''
  });

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTurfData = async () => {
      if (userEmail === 'Unknown') return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('turf_data')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (error) throw error;
        
        if (data) {
          setTurfId(data.turf_id_new);
          setTurfDetails(data as Turf);
          setEditForm({
            address: data.address,
            images: data.images.join(', '),
            pricePerHour: data.pricePerHour.toString(),
            availableTimeSlots: data.availableTimeSlots?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Error fetching turf data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurfData();
  }, [userEmail]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!turfId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('turf_id_new', turfId);

        if (error) throw error;

        const formattedData = data.map(booking => ({
          ...booking,
          booking_id: booking.id,
        }));
        setBookings(formattedData);
        
        // Categorize bookings
        const now = new Date();
        const upcoming = formattedData.filter(booking => {
          const bookingDateTime = parseISO(`${booking.booking_date}T${booking.booking_time}`);
          return isAfter(bookingDateTime, now);
        });
        
        const past = formattedData.filter(booking => {
          const bookingDateTime = parseISO(`${booking.booking_date}T${booking.booking_time}`);
          return isBefore(bookingDateTime, now);
        });

        setUpcomingBookings(upcoming);
        setPastBookings(past);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (turfId) {
      fetchBookings();
    }
  }, [turfId]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turfDetails) return;

    setIsLoading(true);
    try {
      const updatedImages = editForm.images.split(',').map(img => img.trim());
      const updatedPrice = parseFloat(editForm.pricePerHour) || 0;
      const updatedTimeSlots = editForm.availableTimeSlots.split(',').map(slot => slot.trim());

      const { error } = await supabase
        .from('turf_data')
        .update({
          address: editForm.address,
          images: updatedImages,
          pricePerHour: updatedPrice,
          availableTimeSlots: updatedTimeSlots
        })
        .eq('email', userEmail);

      if (error) throw error;

      // Update local state
      setTurfDetails({
        ...turfDetails,
        address: editForm.address,
        images: updatedImages,
        pricePerHour: updatedPrice,
        availableTimeSlots: updatedTimeSlots
      });

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating turf:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turfId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          user_email: manualEntryForm.user_email,
          booking_date: manualEntryForm.booking_date,
          booking_time: manualEntryForm.booking_time,
          turf_id_new: turfId
        }]);

      if (error) throw error;

      // Refresh bookings
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('turf_id_new', turfId);

      if (data) {
        const formattedData = data.map(booking => ({
          ...booking,
          booking_id: booking.id,
        }));
        setBookings(formattedData);
        
        // Categorize bookings
        const now = new Date();
        const upcoming = formattedData.filter(booking => {
          const bookingDateTime = parseISO(`${booking.booking_date}T${booking.booking_time}`);
          return isAfter(bookingDateTime, now);
        });
        
        const past = formattedData.filter(booking => {
          const bookingDateTime = parseISO(`${booking.booking_date}T${booking.booking_time}`);
          return isBefore(bookingDateTime, now);
        });

        setUpcomingBookings(upcoming);
        setPastBookings(past);
      }

      setShowManualEntryModal(false);
      setManualEntryForm({
        user_email: '',
        booking_date: '',
        booking_time: ''
      });
    } catch (error) {
      console.error('Error creating manual booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic for each tab
  const filterBookings = (bookings: Booking[]) => {
    let filtered = [...bookings];

    // Search by user email
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(booking => booking.booking_date === filterDate);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateTimeA = parseISO(`${a.booking_date}T${a.booking_time}`).getTime();
      const dateTimeB = parseISO(`${b.booking_date}T${b.booking_time}`).getTime();
      return sortOrder === 'asc' ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
    });

    return filtered;
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    return format(parseISO(dateString), 'EEE, MMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-0 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-sky-200 rounded-xl shadow-sm p-6 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Turf Owner Dashboard</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">Logged in as:</span>
                  <span className="ml-1 text-blue-600 text-sm">{userEmail}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Hash className="w-4 h-4 mr-2 text-green-600 hidden lg:hidden" />
                  <span className="text-sm font-medium">Turf ID:</span>
                  <span className="ml-1 text-white w-16 text-center text-xl bg-sky-400 p-2 rounded-xl">
                    {isLoading ? (
                      <span className="inline-block h-3 w-16 bg-gray-200 rounded animate-pulse "></span>
                    ) : (
                      turfId || 'Not Found'
                    )}
                  </span>
                </div>
              </div>
            </div>
            {turfDetails && (
              <div className="flex gap-2 hidden lg:flex">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => setShowManualEntryModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Booking
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Turf Info Card */}
        {turfDetails && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-200 rounded-xl shadow-sm p-6 my-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Turf Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-1">{turfDetails.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{turfDetails.address}</p>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-green-600 mr-2">₹{turfDetails.pricePerHour}/hour</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {turfDetails.availableTimeSlots?.length || 0} time slots
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {turfDetails.images.slice(0, 3).map((img, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img 
                        src={img} 
                        alt={`Turf ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-4">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Bookings
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('past')}
            >
              Past Bookings
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by email..."
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <button
                className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="w-4 h-4 mr-1 text-blue-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1 text-blue-600" />
                )}
                Sort {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-sm text-gray-600">Loading bookings...</p>
              </div>
            ) : filterBookings(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Email
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filterBookings(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                        <motion.tr
                          key={booking.booking_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.booking_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {booking.user_email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDisplayDate(booking.booking_date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activeTab === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              <Clock className="w-3 h-3 mr-1" />
                              {booking.booking_time}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No {activeTab} bookings found</h3>
                <p className="text-xs text-gray-500">
                  {searchQuery || filterDate 
                    ? "Try adjusting your search or filter criteria" 
                    : activeTab === 'upcoming' 
                      ? "You don't have any upcoming bookings" 
                      : "No past bookings recorded"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Turf Modal */}
      <AnimatePresence>
        {showEditModal && turfDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Turf Details</h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images (comma separated URLs)</label>
                      <textarea
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={editForm.images}
                        onChange={(e) => setEditForm({...editForm, images: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Hour (₹)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.pricePerHour}
                        onChange={(e) => setEditForm({...editForm, pricePerHour: e.target.value})}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots (comma separated, e.g., 09:00, 10:00)</label>
                      <textarea
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        value={editForm.availableTimeSlots}
                        onChange={(e) => setEditForm({...editForm, availableTimeSlots: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualEntryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add Manual Booking</h2>
                  <button 
                    onClick={() => setShowManualEntryModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleManualEntrySubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={manualEntryForm.user_email}
                        onChange={(e) => setManualEntryForm({...manualEntryForm, user_email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={manualEntryForm.booking_date}
                        onChange={(e) => setManualEntryForm({...manualEntryForm, booking_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking Time</label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={manualEntryForm.booking_time}
                        onChange={(e) => setManualEntryForm({...manualEntryForm, booking_time: e.target.value})}
                        required
                      >
                        <option value="">Select a time slot</option>
                        {turfDetails?.availableTimeSlots?.map((time, index) => (
                          <option key={index} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowManualEntryModal(false)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Adding...' : 'Add Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex justify-around">
          
          <button 
            onClick={() => setShowManualEntryModal(true)}
            className="flex flex-col items-center justify-center p-3 text-gray-600 hover:text-green-600"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1">Add Booking</span>
          </button>
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex flex-col items-center justify-center p-3 text-gray-600 hover:text-blue-600"
          >
            <Edit className="w-5 h-5" />
            <span className="text-xs mt-1">Edit Turf</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurfOwner;