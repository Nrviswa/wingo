import React, { Suspense, lazy } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SkeletonCard } from './components/common/SkeletonCard';
import { AppShell } from './components/layout/AppShell';

const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const TownSelectPage = lazy(() => import('./pages/TownSelectPage'));
const ExperienceSelectPage = lazy(() => import('./pages/ExperienceSelectPage'));
const DaySelectPage = lazy(() => import('./pages/DaySelectPage'));
const ItineraryPage = lazy(() => import('./pages/ItineraryPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const TransitPage = lazy(() => import('./pages/TransitPage'));
const MyTripsPage = lazy(() => import('./pages/MyTripsPage'));
const LocalVendorsPage = lazy(() => import('./pages/LocalVendorsPage'));

const RouteFallback: React.FC = () => (
  <AppShell showBack={false}>
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </AppShell>
);

export const App: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/towns" element={<TownSelectPage />} />
            <Route path="/experience" element={<ExperienceSelectPage />} />
            <Route path="/day" element={<DaySelectPage />} />
            <Route path="/plan" element={<ItineraryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
            <Route path="/transit" element={<TransitPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="/locals" element={<LocalVendorsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
};

export default App;
