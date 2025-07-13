import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import getBulkRequests from '../../../api/bulkRequests.js';
import getCategory from '../../../api/getCategory.js';


const BulkRequestManagement = () => {
  const { token } = useAuth();

  // State for bulk requests and loading
  const [bulkRequests, setBulkRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRequests, setTotalRequests] = useState(0);

  // State for sorting
  const [orderBy, setOrderBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // State for categories
  const [categories, setCategories] = useState([]);





  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategory();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch bulk requests
  const fetchBulkRequests = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        search: searchTerm || undefined,
        category_id: categoryFilter || undefined,
        status: statusFilter || undefined,
        min_quantity: minQuantity ? parseFloat(minQuantity) : undefined,
        max_quantity: maxQuantity ? parseFloat(maxQuantity) : undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        sort_by: orderBy,
        sort_order: order,
      };

      const result = await getBulkRequests(params, token);

      if (result.success) {
        setBulkRequests(result.data?.data || []);
        setTotalRequests(result.data?.pagination?.total || 0);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to fetch bulk requests');
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, searchTerm, categoryFilter, statusFilter, minQuantity, maxQuantity, minPrice, maxPrice, orderBy, order]);

  // Fetch bulk requests when dependencies change
  useEffect(() => {
    fetchBulkRequests();
  }, [fetchBulkRequests]);

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search and filters
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setMinQuantity('');
    setMaxQuantity('');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
  };



  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'primary';
      case 'partially_filled':
        return 'warning';
      case 'fully_filled':
        return 'success';
      case 'closed':
        return 'default';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business />
        Bulk Request Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                label="Category"
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

          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="partially_filled">Partially Filled</MenuItem>
                <MenuItem value="fully_filled">Fully Filled</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              label="Min Quantity"
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              label="Max Quantity"
              type="number"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={clearFilters}
              fullWidth
              size="small"
            >
              Clear
            </Button>
          </Grid>


        </Grid>
      </Paper>

      {/* Bulk Requests Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'quantity_needed'}
                    direction={orderBy === 'quantity_needed' ? order : 'asc'}
                    onClick={() => handleSort('quantity_needed')}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'delivery_deadline'}
                    direction={orderBy === 'delivery_deadline' ? order : 'asc'}
                    onClick={() => handleSort('delivery_deadline')}
                  >
                    Deadline
                  </TableSortLabel>
                </TableCell>
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
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : bulkRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No bulk requests found. Create your first bulk request!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bulkRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {request.title}
                      </Typography>
                      {request.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {request.description.length > 50
                            ? `${request.description.substring(0, 50)}...`
                            : request.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{request.product_name}</TableCell>
                    <TableCell>
                      {request.category_id ?
                        categories.find(cat => cat.id === request.category_id)?.name || 'Unknown Category'
                        : 'No Category'
                      }
                    </TableCell>
                    <TableCell>
                      {request.quantity_needed} {request.unit}
                    </TableCell>
                    <TableCell>
                      {new Date(request.delivery_deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status?.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRequests}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default BulkRequestManagement;
