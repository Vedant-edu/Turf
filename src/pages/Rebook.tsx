'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Repeat } from 'lucide-react'

// This would typically come from an API or database
const recentBookings = [
  { id: 1, name: "Green Meadows Turf", date: "2023-11-20", time: "18:00", location: "Central Park" },
  { id: 2, name: "Sunset Fields", date: "2023-11-18", time: "17:30", location: "West End" },
  { id: 3, name: "City Center Court", date: "2023-11-15", time: "19:00", location: "Downtown" },
]

export default function Rebook() {
  const [bookings, setBookings] = useState(recentBookings)

  const handleRebook = (id: number) => {
    // In a real application, this would call an API to rebook the turf
    console.log(`Rebooking turf with id: ${id}`)
    // For demonstration, we'll just move the booked turf to the top of the list
    setBookings(prevBookings => {
      const bookedTurf = prevBookings.find(booking => booking.id === id)
      const otherBookings = prevBookings.filter(booking => booking.id !== id)
      return [{ ...bookedTurf, date: "2023-11-25" }, ...otherBookings]
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-4 mb-16">
      <h1 className='text-[56px] px-4 flex justify-between text-black font-mono relative z-10'>
        Rebook
      </h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border border-green-200 rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1 p-6">
                <h3 className="text-2xl font-semibold text-green-800 mb-2">{booking.name}</h3>
                <div className="flex items-center gap-2 text-green-600 text-lg">
                  <Calendar className="w-5 h-5" />
                  <span>{booking.date}</span>
                </div>
              </div>
              <div className="flex-1 px-6 py-1 bg-green-100 md:bg-transparent">
                <div className="flex items-center gap-2 text-green-700 text-lg mb-2">
                  <Clock className="w-5 h-5" />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 text-lg">
                  <MapPin className="w-5 h-5" />
                  <span>{booking.location}</span>
                </div>
              </div>
              <div className="p-6">
                <button
                  onClick={() => handleRebook(booking.id)}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white text-lg py-3 px-6 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                >
                  <Repeat className="w-5 h-5 mr-2" />
                  <span>Rebook</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}