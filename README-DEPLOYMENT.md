# Electro E-commerce - AWS Amplify Deployment Guide

## Overview
This project has been prepared for AWS Amplify deployment with a full-stack backend including:
- **Frontend**: Bootstrap 5 responsive e-commerce template
- **Backend**: AWS AppSync GraphQL API with DynamoDB
- **Authentication**: AWS Cognito for user management
- **Storage**: DynamoDB for products, orders, categories, and cart data
- **Images**: S3 bucket for product images with CDN delivery

📋 **See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed AWS services and data flow diagrams**

## Backend Features
- **Products Management**: CRUD operations for products with categories, pricing, and inventory
- **Order Processing**: Complete order management system with status tracking
- **User Authentication**: Secure login/signup with AWS Cognito
- **Shopping Cart**: Persistent cart functionality
- **Categories**: Product categorization system

## Deployment Steps

### Step 1: Create S3 Bucket for Images
1. Go to S3 Console: https://s3.console.aws.amazon.com/
2. Click **"Create bucket"**
3. Bucket name: **electro-ecommerce-images**
4. Region: **us-east-1**
5. **Uncheck "Block all public access"**
6. Click **"Create bucket"**
7. Upload images from `img/` folder to S3 bucket
8. Set bucket policy for public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::electro-ecommerce-images/*"
        }
    ]
}
```

### Step 2: GitHub Deployment with Backend

**Prerequisites:**
- AWS Account with Amplify CLI configured
- GitHub repository: `https://github.com/DalijayTechHub/electro-ecommerce`

**Steps:**
1. Go to https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**
3. Choose **"GitHub"** as source
4. Connect your GitHub account
5. Select repository: **DalijayTechHub/electro-ecommerce**
6. Select branch: **main**
7. App name: **electro-ecommerce**
8. **Enable backend deployment**
9. Click **"Save and deploy"**

**Backend Services Created:**
- GraphQL API (AppSync)
- DynamoDB tables
- S3 bucket integration
- Cognito authentication

### Option 2: Manual Upload
**AWS Amplify Console:**
1. Go to https://console.aws.amazon.com/amplify/
2. Click **"Create new app"**
3. Choose **"Deploy without Git provider"**
4. App name: **electro-ecommerce**
5. Upload project zip file
6. Click **"Save and deploy"**

### 3. Create Backend Services
**DynamoDB Tables:**
1. Go to DynamoDB Console
2. Create table: **Products** (Partition key: id - String)
3. Create table: **Orders** (Partition key: id - String)

**AppSync API:**
1. Go to AppSync Console
2. Click **"Create API"** → **"Build from scratch"**
3. API name: **electro-api**
4. Add GraphQL schema (see below)
5. Create data sources for DynamoDB tables
6. Create resolvers for queries/mutations

### 4. Configure Frontend
1. Copy GraphQL endpoint and API key from AppSync
2. Update `js/amplify-config.js` with actual values
3. Redeploy via Amplify Console

### 5. Add Sample Data
Use AppSync Console → Queries to add products

## GraphQL Schema
Add this schema in AppSync Console:
```graphql
type Product {
  id: ID!
  name: String!
  price: Float!
  category: String!
  imageUrl: String
  inStock: Boolean!
}

type Order {
  id: ID!
  customerEmail: String!
  totalAmount: Float!
  status: String!
}

type Query {
  listProducts: [Product]
  getProduct(id: ID!): Product
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order
}

input CreateOrderInput {
  customerEmail: String!
  totalAmount: Float!
  status: String!
}
```

## Frontend Integration
- `js/amplify-config.js`: AWS Amplify configuration and API operations
- `js/ecommerce.js`: E-commerce functionality (cart, search, checkout)

## Environment Configuration
Update `js/amplify-config.js` with values from AppSync Console:
```javascript
const amplifyConfig = {
  aws_project_region: 'us-east-1',
  aws_appsync_graphqlEndpoint: 'https://YOUR-API-ID.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxxxxxx',
  aws_appsync_authenticationType: 'API_KEY'
};
```

## Sample Data
Add via AppSync Console → Queries (using S3 URLs):
```graphql
mutation {
  createProduct(input: {
    id: "1"
    name: "Apple iPad Mini"
    price: 1050.00
    category: "SmartPhone"
    imageUrl: "https://electro-ecommerce-images.s3.us-east-1.amazonaws.com/product-3.png"
    inStock: true
  }) {
    id name price
  }
}
```

## S3 Image Configuration
The app uses `js/s3-config.js` to automatically convert local image paths to S3 URLs:
- Local: `img/product-3.png`
- S3: `https://electro-ecommerce-images.s3.us-east-1.amazonaws.com/product-3.png`

## Security
- API uses API_KEY for public read access
- Orders require owner authentication
- Cart items are user-specific

## Monitoring
- CloudWatch logs for API monitoring
- Amplify Console for deployment monitoring
- AppSync metrics for GraphQL performance

## Cost Optimization
- DynamoDB on-demand pricing
- API Gateway caching enabled
- CloudFront CDN for static assets

## GitHub Integration Benefits
- **Continuous Deployment**: Auto-deploy on git push
- **Branch Previews**: Test features before merging
- **Rollback**: Easy revert to previous versions
- **Build History**: Track all deployments

## Support
For deployment issues, check:
1. Amplify Console logs
2. CloudWatch logs
3. AWS AppSync console for API errors
4. GitHub Actions (if using CI/CD)