import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Dashboard, Inventory, Business } from '@mui/icons-material';
import ProductManagement from './ProductManagement.jsx';
import BulkRequestManagement from './BulkRequestManagement.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
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
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const FarmerDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();

  // Debug: Log component render
  console.log('FarmerDashboard rendering...', { user, tabValue });

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Farmer Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.username}! Manage your products and bulk requests here.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Dashboard />}
            label="Overview"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Inventory />}
            label="My Products"
            {...a11yProps(1)}
          />
          <Tab
            icon={<Business />}
            label="Bulk Requests"
            {...a11yProps(2)}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview content coming soon...
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ProductManagement />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <BulkRequestManagement />
      </TabPanel>
    </Container>
  );
};

export default FarmerDashboard;
