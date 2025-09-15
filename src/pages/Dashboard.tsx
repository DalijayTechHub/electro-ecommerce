import React from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';
import { AccountCircle, ShoppingBag, Favorite } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <AccountCircle sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h6">
              Welcome, {user?.attributes?.given_name || user?.username}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.attributes?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShoppingBag sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                My Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your order history and track current orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Favorite sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Wishlist
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save items for later purchase
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Profile Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update your personal information
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;