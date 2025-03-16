import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TurfDetails from './pages/TurfDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import Rebook from './pages/Categories';
import MyBookings from './pages/MyBookings';
import Account from './pages/Account';
import Welcome from './pages/Welcome';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import BottomBar from './components/BottomBar';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* Protected routes that require authentication */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Home />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/turf/:id"
            element={
              <>
                <SignedIn>
                  <TurfDetails />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/booking-confirmation"
            element={
              <>
                <SignedIn>
                  <BookingConfirmation />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/rebook"
            element={
              <>
                <SignedIn>
                  <Rebook />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/mybooking"
            element={
              <>
                <SignedIn>
                  <MyBookings />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/account"
            element={
              <>
                <SignedIn>
                  <Account />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />

          {/* Welcome page */}
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

          {/* Redirect any other path */}
          <Route
            path="*"
            element={
              <>
                <SignedIn>
                  <Navigate to="/" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/welcome" replace />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </div>

      {/* Only show BottomBar if the user is signed in and not on the welcome page */}
      
    </BrowserRouter>
  );
}

export default App;