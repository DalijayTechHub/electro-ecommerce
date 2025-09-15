import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, IconButton, Box } from '@mui/material';
import { ShoppingCart, AccountCircle } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Electro
          </Link>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/shop">
            Shop
          </Button>
          
          <IconButton color="inherit" component={Link} to="/cart">
            <Badge badgeContent={state.items.length} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                <AccountCircle sx={{ mr: 1 }} />
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;