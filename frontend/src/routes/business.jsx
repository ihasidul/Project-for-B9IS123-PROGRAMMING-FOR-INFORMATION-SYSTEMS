import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import BusinessDashboard from '../components/dashboard/BusinessDashboard.jsx';

export const Route = createFileRoute('/business')({
  component: BusinessPage,
});

function BusinessPage() {
  const { user, isAuthenticated } = useAuth();

  // Debug: Log business page render
  console.log('BusinessPage rendering...', { user, isAuthenticated: isAuthenticated() });

  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check if user is a business user
  if (user?.userType !== 'business') {
    console.log('User is not a business user, showing access denied');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This dashboard is only available for business users.</p>
        <p>Your account type: {user?.userType}</p>
      </div>
    );
  }

  console.log('User is authenticated business user, rendering BusinessDashboard');
  return <BusinessDashboard />;
}
