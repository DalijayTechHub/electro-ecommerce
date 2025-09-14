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
3. Bucket name: **electro-ecommerce-imgs**
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
            "Resource": "arn:aws:s3:::electro-ecommerce-imgs/*"
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

<!-- ### Option 2: Manual Upload
**AWS Amplify Console:**
1. Go to https://console.aws.amazon.com/amplify/
2. Click **"Create new app"**
3. Choose **"Deploy without Git provider"**
4. App name: **electro-ecommerce**
5. Upload project zip file
6. Click **"Save and deploy"** -->

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
  items: [OrderItem!]!   # new field: list of products in the order
  totalAmount: Float!
  status: String!
}

# Represents a single product inside an order (with quantity)
type OrderItem {
  product: Product!
  quantity: Int!
}

type Query {
  listProducts: [Product]
  getProduct(id: ID!): Product
  listOrders: [Order]             # new query to fetch all orders
  getOrder(id: ID!): Order        # new query to fetch a single order
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order
}

input CreateOrderInput {
  customerEmail: String!
  items: [OrderItemInput!]!       # user must send which products + qty
  status: String!
}

# Input type for products inside an order
input OrderItemInput {
  productId: ID!
  quantity: Int!
}

5. Create data sources for DynamoDB tables
6. Create resolvers for queries/mutations

**Create Data Sources:**
1. Go to **Data Sources** tab → **"Create data source"**
2. **Products Table:**
   - Data source name: `ProductsTable`
   - Data source type: `Amazon DynamoDB table`
   - Table name: `Products`
   - Create new role
3. **Orders Table:**
   - Data source name: `OrdersTable`
   - Data source type: `Amazon DynamoDB table`
   - Table name: `Orders`
   - Use existing role

**Create Resolvers:**
1. Go to **Schema** tab
2. Find each field → **"Attach resolver"**

**For `listProducts` Query:**
- Data source: `ProductsTable`
- Request mapping template:
```vtl
{
    "version": "2017-02-28",
    "operation": "Scan"
}
```
- Response mapping template:
```vtl
$util.toJson($context.result.items)
```

**For `getProduct` Query:**
- Data source: `ProductsTable`
- Request mapping template:
```vtl
{
    "version": "2017-02-28",
    "operation": "GetItem",
    "key": {
        "id": $util.dynamodb.toDynamoDBJson($context.arguments.id)
    }
}
```
- Response mapping template:
```vtl
$util.toJson($context.result)
```

**For `createOrder` Mutation:**
- Data source: `OrdersTable`
- Request mapping template:
```vtl
{
    "version": "2017-02-28",
    "operation": "PutItem",
    "key": {
        "id": $util.dynamodb.toDynamoDBJson($util.autoId())
    },
    "attributeValues": $util.dynamodb.toMapValuesJson($context.arguments.input)
}
```
- Response mapping template:
```vtl
$util.toJson($context.result)
```

### 4. Create Cognito User Pool
1. Go to Cognito Console: https://console.aws.amazon.com/cognito/
2. Click **"User pools"** → **"Create user pool"**
3. **Pool name:** `electro-ecommerce-users`
4. **Sign-in options:** Email
5. **App client name:** `electro-web-client`
6. **Copy User Pool ID** (format: `us-east-1_xxxxxxxxx`)
7. Go to **App integration** tab → **App clients section**
8. **Copy Client ID**

### 5. Configure Frontend
1. **Get API Key from AppSync:**
   - AppSync Console → Your API → Settings
   - Copy API Key

2. **Update `js/amplify-config.js`:**
```javascript
const amplifyConfig = {
  aws_project_region: 'us-east-1',
  aws_appsync_graphqlEndpoint: 'https://ev7foqrqtrb5dfnc5jxzsmncba.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'YOUR_API_KEY_FROM_APPSYNC',
  aws_appsync_realtimeEndpoint: 'wss://ev7foqrqtrb5dfnc5jxzsmncba.appsync-realtime-api.us-east-1.amazonaws.com/graphql',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'YOUR_USER_POOL_ID',
  aws_user_pools_web_client_id: 'YOUR_CLIENT_ID'
};
```

3. **Redeploy via Amplify Console**

### 6. Add Sample Data
Use AppSync Console → Queries to add products


## Frontend Integration
- `js/amplify-config.js`: AWS Amplify configuration and API operations
- `js/ecommerce.js`: E-commerce functionality (cart, search, checkout)

## Complete Configuration Example
```javascript
const amplifyConfig = {
  aws_project_region: 'us-east-1',
  aws_appsync_graphqlEndpoint: 'https://ev7foqrqtrb5dfnc5jxzsmncba.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-yqxugd3k4vdsxlz6mwyqsizqlq',
  aws_appsync_realtimeEndpoint: 'wss://ev7foqrqtrb5dfnc5jxzsmncba.appsync-realtime-api.us-east-1.amazonaws.com/graphql',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_Phg4oT68F',
  aws_user_pools_web_client_id: 'YOUR_CLIENT_ID_FROM_COGNITO'
};
```

**Where to get each value:**
- **GraphQL Endpoint:** AppSync Console → Settings
- **API Key:** AppSync Console → Settings → API Keys
- **User Pool ID:** Cognito Console → User pools → Pool details
- **Client ID:** Cognito Console → User pools → App integration → App clients

## Sample Data
Add via AppSync Console → Queries (using S3 URLs):
```graphql
mutation {
  createProduct(input: {
    id: "1"
    name: "Apple iPad Mini"
    price: 1050.00
    category: "SmartPhone"
    imageUrl: "https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-3.png"
    inStock: true
  }) {
    id name price
  }
}
```

## S3 Image Configuration
The app uses `js/s3-config.js` to automatically convert local image paths to S3 URLs:
- Local: `img/product-3.png`
- S3: `https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/product-3.png`

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