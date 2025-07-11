import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Fab,
  Badge,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import ProductGrid from './ProductGrid.jsx';
import ProductFilters from './ProductFilters.jsx';
import getAllProducts from '../../../api/getAllProducts.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ProductBrowser = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: true,
  });
  const [cart, setCart] = useState([]);

  const { isAuthenticated } = useAuth();
  const limit = 12; // Products per page

  // Load products with current filters and pagination
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const productData = await getAllProducts({
        page,
        limit,
        search: filters.search || null,
        categoryId: filters.categoryId || null,
        isActive: filters.isActive,
        minPrice: filters.minPrice > 0 ? filters.minPrice : null,
        maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : null,
        sortBy: filters.sortBy || "name",
        sortOrder: filters.sortOrder || "asc",
      });

      setProducts(productData);
      
      // Calculate total pages (this would ideally come from the API)
      // For now, we'll estimate based on the number of products returned
      const estimatedTotal = productData.length === limit ? page + 1 : page;
      setTotalPages(estimatedTotal);
      
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters, limit]);

  // Load products when filters or page changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      alert('Please log in to add items to cart');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleViewProduct = (product) => {
    // TODO: Navigate to product detail page
    console.log('View product:', product);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Browse Products
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover fresh produce directly from local farmers
        </Typography>
      </Box>

      {/* Filters */}
      <ProductFilters 
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Products Grid */}
      {!loading && (
        <>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {products.length} products
            </Typography>
          </Box>
          
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
          />
        </>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Floating Cart Button */}
      {isAuthenticated() && getCartItemCount() > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => console.log('Open cart')} // TODO: Open cart
        >
          <Badge badgeContent={getCartItemCount()} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}
    </Container>
  );
};

export default ProductBrowser;
