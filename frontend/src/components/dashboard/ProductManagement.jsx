import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import getUserProducts, { createProduct, deleteProduct, updateProduct } from '../../../api/userProducts.js';
import getCategory from '../../../api/getCategory.js';

const ProductManagement = () => {
  const { token } = useAuth();

  // Debug: Add console log to check if component is being called
  console.log('ProductManagement component rendering...', { token });

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // State for sorting
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // State for categories
  const [categories, setCategories] = useState([]);

  // State for create product dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true,
    photo_url: ''
  });

  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // State for edit product dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true,
    photo_url: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategory();
        setCategories(categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products function with all parameters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        search: searchTerm || undefined,
        category_id: categoryFilter || undefined,
        is_active: statusFilter !== '' ? statusFilter === 'active' : undefined,
        min_price: priceRange.min || undefined,
        max_price: priceRange.max || undefined,
        sort_by: orderBy,
        sort_order: order,
      };

      const result = await getUserProducts(params, token);

      if (result.success) {
        // Handle API response format: data is nested under result.data
        setProducts(result.data?.products || []);
        setTotalProducts(result.data?.pagination?.total || 0);
        console.log('Products fetched successfully:', result.data?.products);
        console.log('Pagination info:', result.data?.pagination);
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
  }, [token, page, rowsPerPage, searchTerm, categoryFilter, statusFilter, priceRange, orderBy, order]);

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting
  };

  // Handle pagination
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle filters
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handlePriceRangeChange = (field) => (event) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setPriceRange({ min: '', max: '' });
    setPage(0);
  };

  // Handle create product
  const handleCreateProduct = async () => {
    setCreateLoading(true);
    setError(null);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        photo_url: formData.photo_url.trim() || null,
      };

      const result = await createProduct(productData, token);

      if (result.success) {
        // Close dialog and reset form
        setOpenCreateDialog(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          category_id: '',
          is_active: true,
          photo_url: ''
        });

        // Refresh the product list
        fetchProducts();

        // Show success message (optional)
        console.log('Product created successfully:', result.data);
      } else {
        // Handle API errors - show message from response for 400-499 errors
        if (result.error && typeof result.error === 'object' && result.error.message) {
          setError(result.error.message);
        } else if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setError('Failed to create product');
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);

      // Handle network or other errors
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // 400-499 errors - show message from response
        const errorMessage = error.response.data?.message || error.response.data?.detail || 'Bad request';
        setError(errorMessage);
      } else {
        setError('Failed to create product. Please try again.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_active: true,
      photo_url: ''
    });
    setOpenCreateDialog(true);
  };

  // Handle delete product confirmation
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setOpenDeleteDialog(true);
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const result = await deleteProduct(productToDelete.id, token);

      if (result.success) {
        // Close dialog and refresh products
        setOpenDeleteDialog(false);
        setProductToDelete(null);
        fetchProducts();

        console.log('Product deleted successfully');
      } else {
        // Handle API errors - show message from response for 400-499 errors
        if (result.error && typeof result.error === 'object' && result.error.message) {
          setError(result.error.message);
        } else if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setError('Failed to delete product');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);

      // Handle network or other errors
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // 400-499 errors - show message from response
        const errorMessage = error.response.data?.message || error.response.data?.detail || 'Bad request';
        setError(errorMessage);
      } else {
        setError('Failed to delete product. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };

  // Handle edit product click
  const handleEditClick = (product) => {
    setProductToEdit(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category_id: product.category_id || '',
      is_active: product.is_active,
      photo_url: product.photo_url || ''
    });
    setOpenEditDialog(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (field) => (event) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle update product
  const handleUpdateProduct = async () => {
    if (!productToEdit) return;

    setEditLoading(true);
    setError(null);

    try {
      const productData = {
        name: editFormData.name.trim(),
        description: editFormData.description.trim() || null,
        price: parseFloat(editFormData.price),
        category_id: editFormData.category_id || null,
        is_active: editFormData.is_active,
        photo_url: editFormData.photo_url.trim() || null,
      };

      const result = await updateProduct(productToEdit.id, productData, token);

      if (result.success) {
        // Close dialog and refresh products
        setOpenEditDialog(false);
        setProductToEdit(null);
        setEditFormData({
          name: '',
          description: '',
          price: '',
          category_id: '',
          is_active: true,
          photo_url: ''
        });

        // Refresh the product list
        fetchProducts();

        console.log('Product updated successfully:', result.data);
      } else {
        // Handle API errors - show message from response for 400-499 errors
        if (result.error && typeof result.error === 'object' && result.error.message) {
          setError(result.error.message);
        } else if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setError('Failed to update product');
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);

      // Handle network or other errors
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // 400-499 errors - show message from response
        const errorMessage = error.response.data?.message || error.response.data?.detail || 'Bad request';
        setError(errorMessage);
      } else {
        setError('Failed to update product. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setOpenEditDialog(false);
    setProductToEdit(null);
    setEditFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_active: true,
      photo_url: ''
    });
  };

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

      {/* Add Product Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
        >
          Add New Product
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
          Search & Filters
        </Typography>
        <Grid container spacing={2} alignItems="end">
          {/* Search */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Products"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label" shrink={!!categoryFilter || categoryFilter === ''}>
                Category
              </InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                label="Category"
                displayEmpty
                notched={!!categoryFilter || categoryFilter === ''}
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

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label" shrink={!!statusFilter || statusFilter === ''}>
                Status
              </InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
                displayEmpty
                notched={!!statusFilter || statusFilter === ''}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Min Price */}
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={priceRange.min}
              onChange={handlePriceRangeChange('min')}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />
          </Grid>

          {/* Max Price */}
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={priceRange.max}
              onChange={handlePriceRangeChange('max')}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
              sx={{ height: '56px' }} // Match TextField height
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => handleSort('price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'created_at'}
                  direction={orderBy === 'created_at' ? order : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {product.description ?
                      (product.description.length > 50 ?
                        `${product.description.substring(0, 50)}...` :
                        product.description
                      ) :
                      'No description'
                    }
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    {product.category_id ?
                      categories.find(cat => cat.id === product.category_id)?.name || 'Unknown Category'
                      : 'No Category'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_active ? 'Active' : 'Inactive'}
                      color={product.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {product.created_at ?
                      new Date(product.created_at).toLocaleDateString() :
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalProducts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create Product Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Add color="primary" />
          Add New Product
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            maxHeight: '60vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}
        >
          {/* Form Fields List */}
          <Box sx={{ p: 0 }}>
            {/* Product Name */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Product Name *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleFormChange('name')}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Product name is required' : ''}
                variant="outlined"
                size="medium"
              />
            </Box>

            {/* Description */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter product description..."
                value={formData.description}
                onChange={handleFormChange('description')}
                variant="outlined"
                size="medium"
              />
            </Box>

            {/* Price */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Price *
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={handleFormChange('price')}
                error={!formData.price || parseFloat(formData.price) <= 0}
                helperText={!formData.price || parseFloat(formData.price) <= 0 ? 'Valid price is required' : ''}
                variant="outlined"
                size="medium"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Box>

            {/* Category */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <FormControl fullWidth variant="outlined" size="medium">
                <Select
                  value={formData.category_id}
                  onChange={handleFormChange('category_id')}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="text.secondary">Select a category</Typography>;
                    }
                    const category = categories.find(cat => cat.id === selected);
                    return category ? category.name : 'Unknown Category';
                  }}
                >
                  <MenuItem value="">
                    <Typography color="text.secondary">No Category</Typography>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Photo URL */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Photo URL
              </Typography>
              <TextField
                fullWidth
                placeholder="https://example.com/image.jpg"
                value={formData.photo_url}
                onChange={handleFormChange('photo_url')}
                variant="outlined"
                size="medium"
              />
              {formData.photo_url && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Preview: {formData.photo_url.length > 50 ? `${formData.photo_url.substring(0, 50)}...` : formData.photo_url}
                </Typography>
              )}
            </Box>

            {/* Status */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <FormControl fullWidth variant="outlined" size="medium">
                <Select
                  value={formData.is_active}
                  onChange={handleFormChange('is_active')}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={selected ? 'Active' : 'Inactive'}
                        color={selected ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  )}
                >
                  <MenuItem value={true}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Active" color="success" size="small" />
                      <Typography>Product will be visible to customers</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={false}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Inactive" color="default" size="small" />
                      <Typography>Product will be hidden from customers</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 2
          }}
        >
          <Button
            onClick={() => setOpenCreateDialog(false)}
            disabled={createLoading}
            variant="outlined"
            size="large"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProduct}
            disabled={createLoading || !formData.name.trim() || !formData.price || parseFloat(formData.price) <= 0}
            startIcon={createLoading ? <CircularProgress size={20} /> : <Add />}
            size="large"
            sx={{ minWidth: 140 }}
          >
            {createLoading ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Delete color="error" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Do you really want to delete this product?
          </Typography>
          {productToDelete && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Product Details:
              </Typography>
              <Typography variant="h6" gutterBottom>
                {productToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Price: ${parseFloat(productToDelete.price).toFixed(2)}
              </Typography>
              {productToDelete.category && (
                <Typography variant="body2" color="text.secondary">
                  Category: {productToDelete.category}
                </Typography>
              )}
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 500 }}>
            ⚠️ This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={deleteLoading}
            variant="outlined"
            size="large"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProduct}
            disabled={deleteLoading}
            variant="contained"
            color="error"
            size="large"
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
            sx={{ minWidth: 140 }}
          >
            {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Edit color="primary" />
          Edit Product
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            maxHeight: '60vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}
        >
          {/* Form Fields List */}
          <Box sx={{ p: 0 }}>
            {/* Product Name */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Product Name *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter product name"
                value={editFormData.name}
                onChange={handleEditFormChange('name')}
                error={!editFormData.name.trim()}
                helperText={!editFormData.name.trim() ? 'Product name is required' : ''}
                variant="outlined"
                size="medium"
              />
            </Box>

            {/* Description */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter product description..."
                value={editFormData.description}
                onChange={handleEditFormChange('description')}
                variant="outlined"
                size="medium"
              />
            </Box>

            {/* Price */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Price *
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={editFormData.price}
                onChange={handleEditFormChange('price')}
                error={!editFormData.price || parseFloat(editFormData.price) <= 0}
                helperText={!editFormData.price || parseFloat(editFormData.price) <= 0 ? 'Valid price is required' : ''}
                variant="outlined"
                size="medium"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Box>

            {/* Category */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <FormControl fullWidth variant="outlined" size="medium">
                <Select
                  value={editFormData.category_id}
                  onChange={handleEditFormChange('category_id')}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="text.secondary">Select a category</Typography>;
                    }
                    const category = categories.find(cat => cat.id === selected);
                    return category ? category.name : 'Unknown Category';
                  }}
                >
                  <MenuItem value="">
                    <Typography color="text.secondary">No Category</Typography>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Photo URL */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Photo URL
              </Typography>
              <TextField
                fullWidth
                placeholder="https://example.com/image.jpg"
                value={editFormData.photo_url}
                onChange={handleEditFormChange('photo_url')}
                variant="outlined"
                size="medium"
              />
              {editFormData.photo_url && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Preview: {editFormData.photo_url.length > 50 ? `${editFormData.photo_url.substring(0, 50)}...` : editFormData.photo_url}
                </Typography>
              )}
            </Box>

            {/* Status */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <FormControl fullWidth variant="outlined" size="medium">
                <Select
                  value={editFormData.is_active}
                  onChange={handleEditFormChange('is_active')}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={selected ? 'Active' : 'Inactive'}
                        color={selected ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  )}
                >
                  <MenuItem value={true}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Active" color="success" size="small" />
                      <Typography>Product will be visible to customers</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={false}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Inactive" color="default" size="small" />
                      <Typography>Product will be hidden from customers</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 2
          }}
        >
          <Button
            onClick={handleCancelEdit}
            disabled={editLoading}
            variant="outlined"
            size="large"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateProduct}
            disabled={editLoading || !editFormData.name.trim() || !editFormData.price || parseFloat(editFormData.price) <= 0}
            startIcon={editLoading ? <CircularProgress size={20} /> : <Edit />}
            size="large"
            sx={{ minWidth: 140 }}
          >
            {editLoading ? 'Updating...' : 'Update Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
