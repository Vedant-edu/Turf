import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import BottomBar from "../components/BottomBar";
import AppBarComponent from "../components/AppBar";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Booking {
  user_email: string;
  turf_name: string;
  booking_date: string;
  booking_time: string;
  amount_paid: string;
}

const BookingsScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);

  // ✅ Fetch bookings from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_email", user.primaryEmailAddress?.emailAddress);

      if (error) {
        console.error("Error fetching bookings:", error);
      } else {
        setBookings(data);
      }
    };

    fetchBookings();
  }, [user]);

  // ✅ Filter bookings based on selected tab
  const today = new Date();
  const filteredBookings = bookings.filter((booking) =>
    activeTab === "upcoming"
      ? new Date(booking.booking_date) >= today
      : new Date(booking.booking_date) < today
  );

  return (
    <div className="max-w-3xl mx-auto">
      <AppBarComponent appbartitle="My Bookings" />

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-6 p-6">
        {["upcoming", "past"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab as "upcoming" | "past")}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button
          className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-md"
          onClick={() => navigate("/welcome")}
        >
          Go to Welcome
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No {activeTab} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {filteredBookings.map((booking, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-5 shadow-lg bg-white transition-transform hover:scale-[1.02]"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.turf_name}
              </h3>
              <p className="text-sm text-gray-500">
                📅 {booking.booking_date} | ⏰ {booking.booking_time}
              </p>
              <p className="mt-2 text-lg font-semibold text-green-600">
                {booking.amount_paid}
              </p>
            </div>
          ))}
        </div>
      )}

      <BottomBar />
    </div>
  );
};

export default BookingsScreen;
