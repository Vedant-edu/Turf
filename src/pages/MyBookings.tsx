import { CalendarDays, Clock, MapPin } from 'lucide-react'

// Sample data for bookings
const bookings = [
  {
    id: 1,
    turfName: 'Green Valley Turf',
    location: 'Central Park',
    date: '2023-11-14',
    time: '14:00 - 15:00',
    status: 'current',
  },
  {
    id: 2,
    turfName: 'Sunset Fields',
    location: 'West End',
    date: '2023-11-15',
    time: '10:00 - 11:00',
    status: 'upcoming',
  },
  {
    id: 3,
    turfName: 'Meadow Grounds',
    location: 'East Side',
    date: '2023-11-16',
    time: '16:00 - 17:00',
    status: 'upcoming',
  },
  {
    id: 4,
    turfName: 'City Center Arena',
    location: 'Downtown',
    date: '2023-11-17',
    time: '18:00 - 19:00',
    status: 'upcoming',
  },
]

const BookingCard = ({ booking }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-102">
    <h3 className="text-lg font-semibold text-green-800 mb-2">{booking.turfName}</h3>
    <div className="flex items-center text-green-600 mb-1">
      <MapPin size={16} className="mr-2 flex-shrink-0" />
      <span className="truncate">{booking.location}</span>
    </div>
    <div className="flex items-center text-green-600 mb-1">
      <CalendarDays size={16} className="mr-2 flex-shrink-0" />
      <span>{booking.date}</span>
    </div>
    <div className="flex items-center text-green-600">
      <Clock size={16} className="mr-2 flex-shrink-0" />
      <span>{booking.time}</span>
    </div>
  </div>
)

export default function MyBookings() {
  const currentBooking = bookings.find(booking => booking.status === 'current')
  const upcomingBookings = bookings.filter(booking => booking.status === 'upcoming')

  return (
    <div className="container mx-auto p-4 ">
      <h1 className='text-[56px] px-4 flex justify-between text-black font-mono relative z-10'>
          Bookings 
            
          </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {currentBooking && (
          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Upcoming Booking</h2>
            <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 transition-all duration-300 ease-in-out hover:bg-green-200">
              <BookingCard booking={currentBooking} />
            </div>
          </div>
        )}
        
        <div className="md:col-span-2 lg:col-span-3">
          <h2 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Recent Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-14">
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-lg">No upcoming bookings.</p>
          )}
        </div>
      </div>
    </div>
  )
}