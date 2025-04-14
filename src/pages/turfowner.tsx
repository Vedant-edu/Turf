import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, ArrowUp, ArrowDown, Clock, Edit, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { addDays } from 'date-fns';
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
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
    const fetchBookings = async () => {
      if (selectedDate && turfId) {
        setIsLoading(true);
        const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('turf_id_new', turfId)
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
  }, [selectedDate, turfId]);

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
          turf_name: turfDetails?.name || '',
          booking_date: manualEntryForm.booking_date,
          booking_time: manualEntryForm.booking_time,
          amount_paid: 0,
          turf_id_new: turfId,

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
    <div className="min-h-screen bg-black pb-20 px-0 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gray-900 rounded-b-xl shadow-lg p-6 sticky top-0 z-10 border-b border-cyan-500/20">
  <div className="flex justify-between items-center">
    {/* Left Section - Branding & User Info */}
    <div className="flex flex-col space-y-1">
      <div className="flex items-end space-x-2">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 neon-text">
          Turfer<sup className="text-blue-400">+</sup>
        </h1>
      </div>
      <div className="flex items-center text-sm">
        <span className="text-gray-400 font-medium">Email:</span>
        <span className="ml-2 text-cyan-300 font-mono truncate max-w-xs">
          {userEmail}
        </span>
      </div>
    </div>

    {/* Right Section - Turf ID & Actions */}
    <div className="flex items-center space-x-4">
      {/* Turf ID in circular container */}
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full border-2 border-cyan-500/30 bg-gray-800 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <span className="text-cyan-300 font-bold text-lg">
            {isLoading ? (
              <span className="inline-block h-3 w-6 bg-gray-700 rounded animate-pulse"></span>
            ) : (
              turfId || '?'
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons (visible on larger screens) */}
      {turfDetails && (
        <div className="hidden lg:flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all text-sm font-medium border border-blue-500/30 shadow-blue-500/20 shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowManualEntryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg hover:from-green-500 hover:to-green-700 transition-all text-sm font-medium border border-green-500/30 shadow-green-500/20 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Booking
          </button>
        </div>
      )}
    </div>
  </div>
</div>



        {/* Turf Info Card */}
        {turfDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl shadow-sm  px-6 my-4"
          >
            
            <div className="">
              <div className="flex justify-between">
              <div>
                <h3 className="text-3xl font-medium text-gray-600 mb-1">{turfDetails.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{turfDetails.address}</p>
              </div>
              <div className="flex gap-2">
                  {turfDetails.images.slice(0, 3).map((img, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={img}
                        alt={`Turf ${index + 1}`}
                        className="w-20 h-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-green-600 mr-2">₹{turfDetails.pricePerHour}/hour</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {turfDetails.availableTimeSlots?.length || 0} time slots
                  </span>
                </div>
              <div>
                
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Section */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-cyan-500/20 overflow-hidden mt-4">
  {/* Tabs */}
  <div className="flex border-b border-gray-700">
    <button
      className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'upcoming' 
        ? 'text-cyan-400' 
        : 'text-gray-400 hover:text-gray-300'}`}
      onClick={() => setActiveTab('upcoming')}
    >
      Upcoming Bookings
      {activeTab === 'upcoming' && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
          layoutId="tabIndicator"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
    <button
      className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'past' 
        ? 'text-cyan-400' 
        : 'text-gray-400 hover:text-gray-300'}`}
      onClick={() => setActiveTab('past')}
    >
      Past Bookings
      {activeTab === 'past' && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
          layoutId="tabIndicator"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  </div>

  {/* Filters */}
  <div className="p-4 border-b border-gray-700 bg-gray-800/50">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search by email..."
          className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-300 placeholder-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="date"
          className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-300 [&::-webkit-calendar-picker-indicator]:filter-invert"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>
      <button
        className="flex items-center justify-center px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors text-gray-300"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="w-4 h-4 mr-1 text-cyan-400" />
        ) : (
          <ArrowDown className="w-4 h-4 mr-1 text-cyan-400" />
        )}
        Sort {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
      </button>
    </div>
  </div>

  {/* Bookings List */}
  <div className="divide-y divide-gray-700">
    {isLoading ? (
      <div className="p-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
        <p className="text-sm text-gray-400">Loading bookings...</p>
      </div>
    ) : filterBookings(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                User Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                Booking ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            <AnimatePresence>
              {filterBookings(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                <motion.tr
                  key={booking.booking_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {formatDisplayDate(booking.booking_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      activeTab === 'upcoming' 
                        ? 'bg-green-900/50 text-green-300 border border-green-800' 
                        : 'bg-gray-700 text-gray-300 border border-gray-600'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {booking.booking_time}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-400">
                    {booking.booking_id}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    ) : (
      <div className="p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-800 mb-3 border border-dashed border-gray-600">
          <Calendar className="h-5 w-5 text-gray-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">
          No {activeTab} bookings found
        </h3>
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
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-200">Edit Turf Details</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Images (comma separated URLs)</label>
                      <textarea
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                        rows={3}
                        value={editForm.images}
                        onChange={(e) => setEditForm({ ...editForm, images: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Price Per Hour (₹)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                        value={editForm.pricePerHour}
                        onChange={(e) => setEditForm({ ...editForm, pricePerHour: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Available Time Slots (comma separated, e.g., 09:00, 10:00)</label>
                      <textarea
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                        rows={2}
                        value={editForm.availableTimeSlots}
                        onChange={(e) => setEditForm({ ...editForm, availableTimeSlots: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-500 hover:bg-gray-700"
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
        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Add Manual Booking</h2>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">User Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                  value={manualEntryForm.user_email}
                  onChange={(e) => setManualEntryForm({ ...manualEntryForm, user_email: e.target.value })}
                  required
                />
              </div>

              {/* Date selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Booking Date</label>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map(date => {
                    const isSelected = manualEntryForm.booking_date === format(date, 'yyyy-MM-dd');
                    return (
                      <motion.button
                        type="button"
                        key={format(date, 'yyyy-MM-dd')}
                        onClick={() => setManualEntryForm({ 
                          ...manualEntryForm, 
                          booking_date: format(date, 'yyyy-MM-dd') 
                        })}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-lg border min-w-[70px] flex flex-col items-center flex-shrink-0
                          ${isSelected ? 'bg-green-600 text-white border-transparent' : 'border-gray-600 hover:border-green-400 bg-gray-700'}
                        `}
                      >
                        <span className="text-xs text-white font-medium">{format(date, 'EEE')}</span>
                        <span className="text-lg text-white font-semibold">{format(date, 'd')}</span>
                        <span className="text-xs text-white mt-1">{format(date, 'MMM')}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Time selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-400">Available Time Slots</h3>
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

                {manualEntryForm.booking_date ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {turfDetails?.availableTimeSlots?.map((time) => {
                      const isBooked = bookedTimeSlots.includes(time);
                      return (
                        <motion.button
                          type="button"
                          key={time}
                          onClick={() => !isBooked && setManualEntryForm({ 
                            ...manualEntryForm, 
                            booking_time: time 
                          })}
                          disabled={isBooked}
                          whileHover={{ scale: !isBooked ? 1.05 : 1 }}
                          whileTap={{ scale: !isBooked ? 0.95 : 1 }}
                          className={`py-3 rounded-lg border flex items-center justify-center gap-1
                            ${isBooked 
                              ? 'bg-gray-700 text-gray-200 cursor-not-allowed border-gray-600' 
                              : manualEntryForm.booking_time === time
                                ? 'bg-green-600 text-white border-transparent shadow-md'
                                : 'border-gray-600 hover:border-green-400 bg-gray-700'
                            }`}
                        >
                          <Clock className={`w-4 h-4 ${manualEntryForm.booking_time === time ? 'text-white' : 'text-gray-500'}`} />
                          <span className="text-sm text-gray-400 font-medium ml-2">{time}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-300">Please select a date to see available time slots</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowManualEntryModal(false)}
                className="px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-500 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={isLoading || !manualEntryForm.booking_date || !manualEntryForm.booking_time}
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

     {/* Bottom Navigation for Mobile - Neon Cyberpunk Style */}
<div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-8rem)] max-w-md rounded-xl backdrop-blur-2xl bg-gray-800/80 border border-gray-800 shadow-2xl shadow-purple-500/20 md:hidden z-50 overflow-hidden transform-gpu hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1">
  {/* Neon Border Glow */}
  <div className="absolute inset-0 rounded-xl pointer-events-none border-[0.5px] border-purple-400/30 shadow-[0_0_10px_1px_rgba(168,85,247,0.3)]"></div>
  
  <div className="flex justify-around p-1">
    {/* Add Booking Button */}
    <button
      onClick={() => setShowManualEntryModal(true)}
      className="flex flex-col items-center justify-center p-3 relative flex-1 rounded-lg group transition-all duration-200 hover:bg-green-900/20"
    >
      {/* Floating & Glow Effect */}
      <div className="absolute inset-0 rounded-lg border border-green-500/0 group-hover:border-green-400/30 group-hover:shadow-[0_0_15px_1px_rgba(74,222,128,0.3)] transition-all duration-300"></div>
      
      <Plus className="w-5 h-5 text-green-400 group-hover:text-green-300 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]" />
      <span className="text-xs mt-1 text-green-400 group-hover:text-green-200 transition-colors">
        Add Booking
      </span>
    </button>

    {/* Edit Turf Button */}
    <button
      onClick={() => setShowEditModal(true)}
      className="flex flex-col items-center justify-center p-3 relative flex-1 rounded-lg group transition-all duration-200 hover:bg-blue-900/20"
    >
      {/* Floating & Glow Effect */}
      <div className="absolute inset-0 rounded-lg border border-blue-500/0 group-hover:border-blue-400/30 group-hover:shadow-[0_0_15px_1px_rgba(96,165,250,0.3)] transition-all duration-300"></div>
      
      <Edit className="w-5 h-5 text-blue-400 group-hover:text-blue-300 drop-shadow-[0_0_4px_rgba(96,165,250,0.5)]" />
      <span className="text-xs mt-1 text-blue-400 group-hover:text-blue-200 transition-colors">
        Edit Turf
      </span>
    </button>
  </div>
</div>
    </div>
  );
};

export default TurfOwner;