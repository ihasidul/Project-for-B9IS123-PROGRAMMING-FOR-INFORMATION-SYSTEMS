import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import getUserProducts from '../../../api/userProducts.js';

const ProductManagement = () => {
  const { token } = useAuth();
  
  // Debug: Add console log to check if component is being called
  console.log('ProductManagement component rendering...', { token });
  
  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products function
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: 1,
        limit: 10,
      };
      
      const result = await getUserProducts(params, token);
      
      if (result.success) {
        setProducts(result.data.products || []);
        console.log('Products fetched successfully:', result.data.products);
      } else {
        setError(result.error);
        console.error('Failed to fetch products:', result.error);
      }
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // Debug: Simple early return to test if component renders
  if (!token) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          No authentication token found. Please log in.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Product Management
      </Typography>
      
      {/* Debug info */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Debug: Component loaded successfully. Token: {token ? 'Present' : 'Missing'}
      </Typography>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Simplified test content */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          🎉 ProductManagement component is rendering successfully!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Products: {products.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
        </Typography>
        
        {/* Display products if any */}
        {products.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Your Products:</Typography>
            {products.map((product, index) => (
              <Typography key={product.id || index} variant="body2">
                • {product.name} - ${product.price}
              </Typography>
            ))}
          </Box>
        )}
        
        {/* Simple test button */}
        <Button 
          variant="contained" 
          sx={{ mt: 2, mr: 2 }}
          onClick={() => alert('ProductManagement is working!')}
        >
          Test Button
        </Button>
        
        {/* Refresh button */}
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={fetchProducts}
          disabled={loading}
        >
          Refresh Products
        </Button>
      </Paper>
    </Box>
  );
};

export default ProductManagement;
