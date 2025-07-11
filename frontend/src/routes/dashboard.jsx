import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import FarmerDashboard from '../components/dashboard/FarmerDashboard.jsx';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Check if user is a farmer (seller)
  if (user?.userType !== 'seller') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This dashboard is only available for farmers.</p>
        <p>Your account type: {user?.userType}</p>
      </div>
    );
  }

  return <FarmerDashboard />;
}
