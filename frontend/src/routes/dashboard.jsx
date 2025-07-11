import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import FarmerDashboard from '../components/dashboard/FarmerDashboard.jsx';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  // Debug: Log dashboard page render
  console.log('DashboardPage rendering...', { user, isAuthenticated: isAuthenticated() });

  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check if user is a farmer (seller)
  if (user?.userType !== 'seller') {
    console.log('User is not a seller, showing access denied');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This dashboard is only available for farmers.</p>
        <p>Your account type: {user?.userType}</p>
      </div>
    );
  }

  console.log('User is authenticated seller, rendering FarmerDashboard');
  return <FarmerDashboard />;
}
