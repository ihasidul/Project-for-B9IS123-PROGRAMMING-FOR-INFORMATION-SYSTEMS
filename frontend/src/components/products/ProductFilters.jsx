import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Chip,
  Paper,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import getCategory from '../../../api/getCategory.js';

const ProductFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: true,
    ...initialFilters
  });

  const [categories, setCategories] = useState([]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await getCategory();
        setCategories(categoryData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'name',
      sortOrder: 'asc',
      isActive: true,
    };
    setFilters(clearedFilters);
    setPriceRange([0, 1000]);
    onFiltersChange(clearedFilters);
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'created_at', label: 'Date Added' },
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 1000) count++;
    return count;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6">
          Filters
        </Typography>
        {getActiveFiltersCount() > 0 && (
          <Chip 
            label={`${getActiveFiltersCount()} active`}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
        <Box flexGrow={1} />
        <Button
          startIcon={<Clear />}
          onClick={handleClearFilters}
          size="small"
        >
          Clear All
        </Button>
      </Box>

      <Grid container spacing={2} alignItems="flex-end">
        {/* Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search products"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 200 }}
          />
        </Grid>

        {/* Category */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.categoryId}
              label="Category"
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort By */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort by"
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort Order */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{ minWidth: 100 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder}
              label="Order"
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <MenuItem value="asc">A-Z</MenuItem>
              <MenuItem value="desc">Z-A</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Min Price */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Min Price"
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', Number(e.target.value) || 0)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
            sx={{ minWidth: 100 }}
          />
        </Grid>

        {/* Max Price */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || 1000)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
            sx={{ minWidth: 100 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductFilters;
