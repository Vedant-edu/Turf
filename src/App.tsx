import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TurfDetails from './pages/TurfDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import Rebook from './pages/Categories';
import MyBookings from './pages/MyBookings';
import Account from './pages/Account';
import BottomBar from './components/BottomNavbar';
import Welcome from './pages/Welcome';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* Protected routes that require authentication */}
          <Route
            path="/"
            element={
              <SignedIn>
                <Home />
              </SignedIn>
            }
          />
          <Route
            path="/turf/:id"
            element={<TurfDetails />}
          />
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />
          <Route
            path="/rebook"
            element={<Rebook />}
          />
          <Route
            path="/mybooking"
            element={<MyBookings />}
          />
          <Route
            path="/account"
            element={<Account />}
          />
          
          {/* Welcome page with redirect logic */}
          <Route
            path="/welcome"
            element={
              <>
                <SignedIn>
                  <Navigate to="/" replace />
                </SignedIn>
                <SignedOut>
                  <Welcome />
                </SignedOut>
              </>
            }
          />
          
          {/* Default redirect for unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/welcome" replace />}
          />
        </Routes>
        
        {/* Only show BottomBar if the current path is not "/welcome" */}
      </div>
        {window.location.pathname !== '/welcome' && <BottomBar />}
    </BrowserRouter>
  );
}

export default App;