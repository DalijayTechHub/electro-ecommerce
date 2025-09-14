// AWS Amplify will be loaded via CDN

// Amplify v5 configuration
const amplifyConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_2o9soyelp',
    userPoolWebClientId: '464fopbqusvc5m9pmjs8cg0g08'
  },
  aws_appsync_graphqlEndpoint: 'https://um4cwum3fnddff25vptholns3a.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: '4g3ccvfuqrfz3n4kaweasfueza'
};

// Configuration will be applied when Amplify loads
window.amplifyConfig = amplifyConfig;

// Product operations
window.productOperations = {
  async getAllProducts() {
    const query = `
      query ListProducts {
        listProducts {
          items {
            id name description price originalPrice category imageUrl
            inStock featured isNew onSale rating createdAt
          }
        }
      }
    `;
    return await client.graphql({ query });
  },

  async getProductsByCategory(category) {
    const query = `
      query ListProducts($filter: ModelProductFilterInput) {
        listProducts(filter: $filter) {
          items {
            id name description price originalPrice category imageUrl
            inStock featured isNew onSale rating createdAt
          }
        }
      }
    `;
    return await client.graphql({ 
      query, 
      variables: { filter: { category: { eq: category } } }
    });
  },

  async createProduct(productData) {
    const mutation = `
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          id name description price originalPrice category imageUrl
          inStock featured isNew onSale rating createdAt
        }
      }
    `;
    return await client.graphql({ 
      query: mutation, 
      variables: { input: productData }
    });
  }
};

// Order operations
window.orderOperations = {
  async createOrder(orderData) {
    const mutation = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id customerEmail customerName totalAmount status createdAt
        }
      }
    `;
    return await client.graphql({ 
      query: mutation, 
      variables: { input: orderData }
    });
  },

  async getOrdersByEmail(email) {
    const query = `
      query ListOrders($filter: ModelOrderFilterInput) {
        listOrders(filter: $filter) {
          items {
            id customerEmail customerName items totalAmount status
            shippingAddress createdAt updatedAt
          }
        }
      }
    `;
    return await client.graphql({ 
      query, 
      variables: { filter: { customerEmail: { eq: email } } }
    });
  }
};

// Category operations
window.categoryOperations = {
  async getAllCategories() {
    const query = `
      query ListCategories {
        listCategories {
          items {
            id name description imageUrl productCount createdAt
          }
        }
      }
    `;
    return await client.graphql({ query });
  }
};

// Authentication operations
window.authOperations = {
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserSession() {
    try {
      const session = await fetchAuthSession();
      return { success: true, session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Cart operations (requires authentication)
window.cartOperations = {
  async addToCart(productId, quantity, userId) {
    const mutation = `
      mutation CreateCartItem($input: CreateCartItemInput!) {
        createCartItem(input: $input) {
          id productId quantity userId createdAt
        }
      }
    `;
    return await client.graphql({ 
      query: mutation, 
      variables: { 
        input: { productId, quantity, userId }
      }
    });
  },

  async getCartItems(userId) {
    const query = `
      query ListCartItems($filter: ModelCartItemFilterInput) {
        listCartItems(filter: $filter) {
          items {
            id productId quantity userId createdAt
          }
        }
      }
    `;
    return await client.graphql({ 
      query, 
      variables: { filter: { userId: { eq: userId } } }
    });
  },

  async removeFromCart(cartItemId) {
    const mutation = `
      mutation DeleteCartItem($input: DeleteCartItemInput!) {
        deleteCartItem(input: $input) {
          id
        }
      }
    `;
    return await client.graphql({ 
      query: mutation, 
      variables: { input: { id: cartItemId } }
    });
  }
};
