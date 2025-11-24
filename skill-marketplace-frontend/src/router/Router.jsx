import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from '../components/ProtectedRoute';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/gigs" element={<GigsPage />} />
        <Route path="/gig/:id" element={<GigDetailPage />} />
        
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
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
