import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, History, CalendarCheck } from "lucide-react";
import BottomBar from "../components/BottomBar";
import AppBarComponent from "../components/AppBar";

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Booking {
  id: string;
  user_email: string;
  turf_name: string;
  booking_date: string;
  booking_time: string;
  amount_paid: string;
  turf_id: string;
}

const BookingsScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format date to more readable form
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Fetch bookings from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_email", user.primaryEmailAddress?.emailAddress)
          .order("booking_date", { ascending: true });

        if (error) {
          console.error("Error fetching bookings:", error);
        } else {
          setBookings(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Filter bookings based on selected tab
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.booking_date);
    return activeTab === "upcoming"
      ? bookingDate >= today
      : bookingDate < today;
  });

  return (
    <div className="max-w-3xl mx-auto min-h-screen">
      <AppBarComponent appbartitle="My Bookings" />

      <div className="px-4 pt-2 pb-20">
        {/* Tab Navigation with modern design */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          {[
            { value: "upcoming", icon: CalendarCheck, label: "Upcoming" },
            { value: "past", icon: History, label: "Past" }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.value}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  activeTab === tab.value
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.value as "upcoming" | "past")}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        ) : (
          <>
            {/* Empty state */}
            {filteredBookings.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  {activeTab === "upcoming" ? (
                    <CalendarCheck className="w-8 h-8 text-green-600" />
                  ) : (
                    <History className="w-8 h-8 text-green-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No {activeTab} bookings
                </h3>
                <p className="text-gray-500 max-w-md">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming bookings. Book a turf to get started!"
                    : "Your past bookings will appear here."}
                </p>
                {activeTab === "upcoming" && (
                  <button
                    onClick={() => navigate("/")}
                    className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Browse Turfs
                  </button>
                )}
              </motion.div>
            )}

            {/* Bookings List */}
            <AnimatePresence>
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                    
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.turf_name}
                        </h3>
                        <div className="flex items-center text-gray-500 mt-1 space-x-4">
                          <span className="flex items-center text-sm">
                            <CalendarDays className="w-4 h-4 mr-1.5" />
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1.5" />
                            {booking.booking_time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {booking.amount_paid}
                        </p>
                        
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>

      <BottomBar />
    </div>
  );
};

export default BookingsScreen;