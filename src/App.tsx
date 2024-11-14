import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TurfDetails from './pages/TurfDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import Rebook from './pages/Rebook';
import MyBookings from './pages/MyBookings';
import Account from './pages/Account';
import BottomNavbar from './components/BottomNavbar';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import Welcome from './pages/Welcome';

function App() {
  return (
    <KindeProvider
      clientId="9ca5369c6f3c4d3cbed9d742979c7ded"
      domain="http://localhost:3000"
      logoutUri="http://localhost:3000/welcome"
      redirectUri="http://localhost:3000"
    >
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/turf/:id" element={<TurfDetails />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/rebook" element={<Rebook />} />
            <Route path="/mybooking" element={<MyBookings />} />
            <Route path="/account" element={<Account />} />
            <Route path="/welcome" element={<Welcome />} />
          </Routes>
          <BottomNavbar />
        </div>
      </BrowserRouter>
    </KindeProvider>
  );
}

export default App;