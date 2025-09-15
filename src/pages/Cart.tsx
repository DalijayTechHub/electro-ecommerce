import React from 'react';
import { Container, Typography, Card, CardContent, Grid, Button, IconButton, Box, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  if (state.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shopping Cart
        </Typography>
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} href="/shop">
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {state.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: 'auto', maxHeight: 100 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        size="small"
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        size="small"
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h6">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton
                      onClick={() => removeItem(item.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${state.total.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>Free</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${state.total.toFixed(2)}</Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mb: 2 }}
                component={Link}
                to="/checkout"
              >
                Proceed to Checkout
              </Button>
              <Button variant="outlined" fullWidth onClick={clearCart}>
                Clear Cart
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;