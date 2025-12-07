import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/Auth/LoginPage';
import SignUpPage from '../pages/Auth/SignUpPage';
import DashboardPage from '../pages/DashboardPage';
import CreateGigPage from '../pages/CreateGigPage';
import GigsPage from '../pages/GigsPage';
import GigDetailPage from '../pages/GigDetailPage';
import TeamPage from '../pages/TeamPage';
import WalletPage from '../pages/WalletPage';
import EditProfilePage from '../pages/EditProfilePage';
import ManageOffersPage from '../pages/ManageOffersPage';
import ProfilePage from '../pages/ProfilePage';
import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';

const AppRoutes = () => {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/gigs" element={<GigsPage />} />
        <Route path="/gig/:id" element={<GigDetailPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/create-gig" element={
          <ProtectedRoute>
            <CreateGigPage />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/team/:id" element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        <Route path="/manage-offers" element={
          <ProtectedRoute>
            <ManageOffersPage />
          </ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
      </Routes>
  );
};

export default AppRoutes;
