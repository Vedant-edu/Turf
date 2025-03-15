import { useState, useEffect } from "react";
import { mockBookings } from "../data/mock";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface Booking {
  userEmail: string;
  turfId: string;
  turfName: string;
  bookingDate: string;
  bookingTime: string;
  amountPaid: string;
}

const BookingsScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate(); // Initialize navigate
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    const userBookings = mockBookings.filter(
      (booking) => booking.userEmail === user.primaryEmailAddress?.emailAddress
    );

    setFilteredBookings(
      userBookings.filter((booking) =>
        activeTab === "upcoming"
          ? new Date(booking.bookingDate) >= today
          : new Date(booking.bookingDate) < today
      )
    );
  }, [user, activeTab]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-6">
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
          onClick={() => navigate("/welcome")} // Navigate to /welcome
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
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-5 shadow-lg bg-white transition-transform hover:scale-[1.02]"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.turfName}
              </h3>
              <p className="text-sm text-gray-500">
                📅 {booking.bookingDate} | ⏰ {booking.bookingTime}
              </p>
              <p className="mt-2 text-lg font-semibold text-green-600">
                ₹{booking.amountPaid}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsScreen;
