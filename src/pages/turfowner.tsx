import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, ArrowUp, ArrowDown, User, Clock, Hash, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Booking {
  booking_id: number;
  user_email: string;
  booking_date: string;
  booking_time: string;
}

interface Turf {
  turf_id_new: number;
  name: string;
  address: string;
  images: string[];
  pricePerHour: number;
  email: string;
}

const TurfOwner: React.FC = () => {
  const location = useLocation();
  const userEmail = location.state?.email || 'Unknown';
  const [turfId, setTurfId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [turfDetails, setTurfDetails] = useState<Turf | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    address: '',
    images: '',
    pricePerHour: ''
  });
  
  // Filter, Sort, and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTurfData = async () => {
      if (userEmail === 'Unknown') return;

      setIsLoading(true);
      try {
        // Fetch turf ID and details
        const { data, error } = await supabase
          .from('turf_data')
          .select('turf_id_new, name, address, images, pricePerHour, email')
          .eq('email', userEmail)
          .single();

        if (error) throw error;
        
        if (data) {
          setTurfId(data.turf_id_new);
          setTurfDetails(data as Turf);
          setEditForm({
            address: data.address,
            images: data.images.join(', '),
            pricePerHour: data.pricePerHour.toString()
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
          .select('id, user_email, booking_date, booking_time')
          .eq('turf_id_new', turfId);

        if (error) throw error;

        const formattedData = data.map(booking => ({
          ...booking,
          booking_id: booking.id,
        }));
        setBookings(formattedData);
        setFilteredBookings(formattedData);
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

      const { error } = await supabase
        .from('turf_data')
        .update({
          address: editForm.address,
          images: updatedImages,
          pricePerHour: updatedPrice
        })
        .eq('email', userEmail);

      if (error) throw error;

      // Update local state
      setTurfDetails({
        ...turfDetails,
        address: editForm.address,
        images: updatedImages,
        pricePerHour: updatedPrice
      });

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating turf:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and Sort Logic
  useEffect(() => {
    let updatedBookings = [...bookings];

    // Search by user email
    if (searchQuery) {
      updatedBookings = updatedBookings.filter(booking =>
        booking.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate) {
      updatedBookings = updatedBookings.filter(booking => booking.booking_date === filterDate);
    }

    // Sort by date and time
    updatedBookings.sort((a, b) => {
      const dateTimeA = new Date(`${a.booking_date} ${a.booking_time}`).getTime();
      const dateTimeB = new Date(`${b.booking_date} ${b.booking_time}`).getTime();
      return sortOrder === 'asc' ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
    });

    setFilteredBookings(updatedBookings);
  }, [searchQuery, filterDate, sortOrder, bookings]);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 ">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Turf Owner Dashboard</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium">Logged in as:</span>
                  <span className="ml-1 text-blue-600">{userEmail}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Hash className="w-5 h-5 mr-2 text-green-600" />
                  <span className="font-medium">Turf ID:</span>
                  <span className="ml-1 text-green-600">
                    {isLoading ? (
                      <span className="inline-block h-4 w-20 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      turfId || 'Not Found'
                    )}
                  </span>
                </div>
              </div>
            </div>
            {turfDetails && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit Turf
              </button>
            )}
          </div>
        </div>

        {/* Turf Info Card */}
        {turfDetails && (
          <div className="bg-gray-200 rounded-xl  p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Turf Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{turfDetails.name}</h3>
                <p className="text-gray-600 mb-4">{turfDetails.address}</p>
                <p className="text-lg font-semibold text-green-600">₹{turfDetails.pricePerHour}/hour</p>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {turfDetails.images.slice(0, 3).map((img, index) => (
                    <img 
                      key={index} 
                      src={img} 
                      alt={`Turf ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='bg-gray-100 rounded-xl'>
            {/* Filters & Sorting */}
        <div className=" rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="w-5 h-5 mr-2 text-blue-600" />
              ) : (
                <ArrowDown className="w-5 h-5 mr-2 text-blue-600" />
              )}
              Sort {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className=" rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-sky-100 divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredBookings.map((booking) => (
                      <motion.tr
                        key={booking.booking_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.booking_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(booking.booking_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
              <p className="text-gray-500">
                {searchQuery || filterDate 
                  ? "Try adjusting your search or filter criteria" 
                  : "You don't have any bookings yet"}
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
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images (comma separated URLs)</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.pricePerHour}
                        onChange={(e) => setEditForm({...editForm, pricePerHour: e.target.value})}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
    </div>
  );
};

export default TurfOwner;