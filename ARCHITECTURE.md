# AWS Architecture & Data Flow

## AWS Services Used

### 1. **AWS Amplify**
- **Purpose**: Frontend hosting and CI/CD
- **Features**: Static web hosting, SSL certificates, CDN distribution

### 2. **AWS AppSync**
- **Purpose**: GraphQL API gateway
- **Features**: Real-time subscriptions, caching, authorization

### 3. **Amazon DynamoDB**
- **Purpose**: NoSQL database
- **Tables**: Products, Orders, Categories, CartItems

### 4. **Amazon CloudFront**
- **Purpose**: Content Delivery Network (CDN)
- **Features**: Global edge locations, caching

### 5. **AWS IAM**
- **Purpose**: Identity and access management
- **Features**: Service roles, API permissions

### 6. **Amazon CloudWatch**
- **Purpose**: Monitoring and logging
- **Features**: API metrics, error tracking

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│     Users       │───▶│   CloudFront     │───▶│  AWS Amplify    │
│   (Browsers)    │    │      (CDN)       │    │   (Frontend)    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         │ API Calls
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   CloudWatch    │◀───│   AWS AppSync    │───▶│      IAM        │
│   (Monitoring)  │    │  (GraphQL API)   │    │   (Security)    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │ Database Operations
                                ▼
                       ┌──────────────────┐
                       │                  │
                       │   DynamoDB       │
                       │                  │
                       │ ┌──────────────┐ │
                       │ │   Products   │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │    Orders    │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │  Categories  │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │  CartItems   │ │
                       │ └──────────────┘ │
                       └──────────────────┘
```

## Data Flow

### 1. **User Request Flow**
```
User Browser → CloudFront → Amplify → Static Files (HTML/CSS/JS)
```

### 2. **API Request Flow**
```
Frontend JS → AppSync GraphQL → DynamoDB Tables
```

### 3. **Product Listing Flow**
```
1. User loads homepage
2. Frontend calls listProducts query
3. AppSync receives GraphQL request
4. AppSync resolver queries Products table
5. DynamoDB returns product data
6. AppSync formats response
7. Frontend renders products
```

### 4. **Order Creation Flow**
```
1. User clicks "Add to Cart"
2. Frontend calls createOrder mutation
3. AppSync validates request
4. AppSync resolver writes to Orders table
5. DynamoDB stores order data
6. Success response sent to frontend
7. UI updates with confirmation
```

### 5. **Monitoring Flow**
```
All Services → CloudWatch → Logs & Metrics → Alerts
```

## Security Model

### **API Security**
- **Public Access**: Product listings (API Key)
- **Authenticated**: Orders, Cart operations
- **IAM Roles**: Service-to-service communication

### **Data Security**
- **Encryption**: DynamoDB encryption at rest
- **HTTPS**: All API calls encrypted in transit
- **CORS**: Configured for frontend domain

## Scalability Features

### **Auto-Scaling**
- **DynamoDB**: On-demand scaling
- **AppSync**: Automatic scaling
- **CloudFront**: Global edge caching

### **Performance**
- **CDN Caching**: Static assets cached globally
- **API Caching**: GraphQL responses cached
- **Database**: Single-digit millisecond latency

## Cost Structure

### **Pay-per-Use Services**
- **DynamoDB**: Per request + storage
- **AppSync**: Per GraphQL request
- **CloudFront**: Per data transfer

### **Fixed Costs**
- **Amplify**: Per build minute + hosting
- **CloudWatch**: Per log ingestion

## High Availability

### **Multi-AZ Deployment**
- **DynamoDB**: Automatically replicated
- **AppSync**: Multi-region availability
- **CloudFront**: Global edge locations

### **Backup & Recovery**
- **DynamoDB**: Point-in-time recovery
- **Amplify**: Git-based deployments
- **CloudWatch**: Log retention policies