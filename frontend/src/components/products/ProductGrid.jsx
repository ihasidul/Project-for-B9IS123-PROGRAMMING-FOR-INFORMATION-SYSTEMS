import React from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import { ShoppingCart, Visibility } from '@mui/icons-material';

const ProductGrid = ({ products, onAddToCart, onViewProduct }) => {
  if (!products || products.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <Typography variant="h6" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            {product.photo_url ? (
              <CardMedia
                component="img"
                height="200"
                image={product.photo_url}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                height="200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="grey.200"
                sx={{ overflow: 'hidden' }}
              >
                <img
                  src="placeholder-product.webp"
                  alt="Placeholder Product Image"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
            
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h3" gutterBottom noWrap>
                {product.name}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  mb: 2
                }}
              >
                {product.description || 'No description available'}
              </Typography>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${product.price}
                </Typography>
                
                <Chip 
                  label={product.is_active ? 'Available' : 'Out of Stock'}
                  color={product.is_active ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              {product.category && (
                <Chip 
                  label={product.category}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2, alignSelf: 'flex-start' }}
                />
              )}

              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => onViewProduct && onViewProduct(product)}
                  sx={{ flex: 1 }}
                >
                  View
                </Button>
                
                <IconButton
                  color="primary"
                  onClick={() => onAddToCart && onAddToCart(product)}
                  disabled={!product.is_active}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'primary.main',
                    '&:disabled': {
                      borderColor: 'grey.300',
                    }
                  }}
                >
                  <ShoppingCart />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;
