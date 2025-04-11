import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Home from './pages/Home';
import TurfDetails from './pages/TurfDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import Rebook from './pages/Categories';
import MyBookings from './pages/MyBookings';
import Account from './pages/Account';
import Welcome from './pages/Welcome';
import AdminAddTurf from './pages/admin';
import TurfOwner from './pages/turfowner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes (require authentication) */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/turf/:id"
          element={
            <RequireAuth>
              <TurfDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/booking-confirmation"
          element={
            <RequireAuth>
              <BookingConfirmation />
            </RequireAuth>
          }
        />
        <Route
          path="/rebook"
          element={
            <RequireAuth>
              <Rebook />
            </RequireAuth>
          }
        />
        <Route
          path="/mybooking"
          element={
            <RequireAuth>
              <MyBookings />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminAddTurf />
            </RequireAuth>
          }
        />
        <Route
          path="/turfowner"
          element={
            <RequireAuth>
              <TurfOwner />
            </RequireAuth>
          }
        />

        {/* Public routes */}
        <Route
          path="/welcome"
          element={
            <PublicOnly>
              <Welcome />
            </PublicOnly>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
// Component to handle authentication requirement
function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/welcome" replace />
      </SignedOut>
    </>
  );
}
// Component to prevent authenticated users from accessing public routes
function PublicOnly({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <Navigate to="/" replace />
      </SignedIn>
      <SignedOut>{children}</SignedOut>
    </>
  );
}

export default App;