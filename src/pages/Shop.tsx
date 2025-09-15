import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useCart } from '../context/CartContext';
import { API, graphqlOperation } from 'aws-amplify';

const listProducts = `
  query ListProducts {
    listProducts {
      id
      name
      price
      category
      imageUrl
      inStock
    }
  }
`;

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const result: any = await API.graphql(graphqlOperation(listProducts));
      setProducts(result.data.listProducts || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data
      setProducts([
        { id: '1', name: 'Apple iPad Mini', price: 1050, category: 'Tablets', imageUrl: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-3.png', inStock: true },
        { id: '2', name: 'Samsung Galaxy Tab', price: 850, category: 'Tablets', imageUrl: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-4.png', inStock: true },
        { id: '3', name: 'MacBook Pro', price: 2500, category: 'Laptops', imageUrl: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-5.png', inStock: true },
        { id: '4', name: 'iPhone 14', price: 999, category: 'Smartphones', imageUrl: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-6.png', inStock: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shop
      </Typography>
      
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.category}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${product.price}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Shop;