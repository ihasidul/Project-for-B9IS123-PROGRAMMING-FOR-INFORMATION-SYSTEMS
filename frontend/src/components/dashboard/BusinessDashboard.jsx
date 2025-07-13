import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Dashboard, Business } from '@mui/icons-material';
import BulkRequestManagement from './BulkRequestManagement.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`business-dashboard-tabpanel-${index}`}
      aria-labelledby={`business-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `business-dashboard-tab-${index}`,
    'aria-controls': `business-dashboard-tabpanel-${index}`,
  };
}

const BusinessDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();

  // Debug: Log component render
  console.log('BusinessDashboard rendering...', { user, tabValue });

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Business Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.username}! Manage your bulk requests and orders here.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="business dashboard tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Dashboard />}
            label="Overview"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Business />}
            label="My Requests"
            {...a11yProps(1)}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your business dashboard. Here you can manage your bulk requests and track orders.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • View and manage your bulk requests in the "My Requests" tab
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Track order status and delivery information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Create new bulk requests to find suppliers
            </Typography>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <BulkRequestManagement />
      </TabPanel>
    </Container>
  );
};

export default BusinessDashboard;
