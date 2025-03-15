import React from 'react';
import TurfDetails from './pages/TurfDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import Rebook from './pages/Rebook';
import MyBookings from './pages/MyBookings';
import Account from './pages/Account';
import BottomNavbar from './components/BottomNavbar';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
const Provider = () => {
  return (
    <div className="">
        <Route path="/turf/:id" element={<TurfDetails />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/rebook" element={<Rebook />} />
            <Route path="/mybooking" element={<MyBookings />} />
            <Route path="/account" element={<Account />} />
      
    </div>
  );
};

export default Provider;
