import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const featuredProducts = [
    { id: '1', name: 'Apple iPad Mini', price: 1050, image: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-3.png' },
    { id: '2', name: 'Samsung Galaxy Tab', price: 850, image: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-4.png' },
    { id: '3', name: 'MacBook Pro', price: 2500, image: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-5.png' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'url(https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/carousel-1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Box textAlign="center" sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', p: 4, borderRadius: 2 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Electro
          </Typography>
          <Typography variant="h5" gutterBottom>
            Your One-Stop Electronics Store
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/shop"
            sx={{ mt: 2 }}
          >
            Shop Now
          </Button>
        </Box>
      </Box>

      {/* Featured Products */}
      <Typography variant="h4" component="h2" gutterBottom textAlign="center">
        Featured Products
      </Typography>
      
      <Grid container spacing={4}>
        {featuredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  component={Link}
                  to="/shop"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;