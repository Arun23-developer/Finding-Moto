# Finding Moto - Comprehensive API Documentation

**Project**: AI Powered Automobile Marketplace - Finding Moto  
**API Version**: 1.0  
**Document Date**: April 29, 2026  
**Base URL**: `http://localhost:5000/api` (Development) or `{PRODUCTION_URL}/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [User Management APIs](#user-management-apis)
5. [Product Management APIs](#product-management-apis)
6. [Order Management APIs](#order-management-apis)
7. [Cart APIs](#cart-apis)
8. [Seller Dashboard APIs](#seller-dashboard-apis)
9. [Mechanic Dashboard APIs](#mechanic-dashboard-apis)
10. [Admin Dashboard APIs](#admin-dashboard-apis)
11. [Chat APIs](#chat-apis)
12. [AI/Chatbot APIs](#aichatbot-apis)
13. [Review APIs](#review-apis)
14. [Service Order APIs](#service-order-apis)
15. [Delivery APIs](#delivery-apis)
16. [Notification APIs](#notification-apis)
17. [Report APIs](#report-apis)
18. [Return APIs](#return-apis)

---

## Overview

### Base Configuration
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **Rate Limiting**: Implemented on sensitive endpoints
- **CORS**: Enabled for configured origins

### Request Headers (Required for Protected Endpoints)
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Supported Media Types
- `application/json`
- `multipart/form-data` (for file uploads)

---

## Authentication

### JWT Token Structure
Tokens are issued on login and must be included in all protected endpoints.

**Token Payload**:
```json
{
  "id": "user_id",
  "iat": 1619865600,
  "exp": 1620470400
}
```

**Token Expiry**: 7 days (configurable via `JWT_EXPIRES_IN`)

### Login Endpoint
```
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "buyer",
    "avatar": "https://cloudinary.com/image.jpg"
  }
}
```

### Google OAuth Login
```
POST /api/auth/google
```

**Request Body**:
```json
{
  "token": "google_id_token"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { /* user object */ }
}
```

### Logout
```
POST /api/auth/logout
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "ERROR_CODE" (optional)
}
```

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/conflict error |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database down |

### Common Error Codes
- `INVALID_CREDENTIALS`: Wrong email/password
- `USER_NOT_FOUND`: User doesn't exist
- `UNAUTHORIZED_ACCESS`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `DATABASE_ERROR`: Database operation failed
- `FILE_UPLOAD_ERROR`: Image upload failed

---

## User Management APIs

### Base Route: `/api/auth`

### 1. Register User
```
POST /api/auth/register
```

**Request Body** (Buyer):
```json
{
  "role": "buyer",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Pass@123",
  "phone": "9876543210"
}
```

**Request Body** (Seller):
```json
{
  "role": "seller",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "Pass@123",
  "phone": "9876543211",
  "shopName": "AutoParts Store",
  "shopDescription": "Premium motorcycle parts",
  "shopLocation": "Chennai",
  "sellerSpecializations": ["Engine", "Suspension"]
}
```

**Request Body** (Mechanic):
```json
{
  "role": "mechanic",
  "firstName": "Ram",
  "lastName": "Kumar",
  "email": "ram@example.com",
  "password": "Pass@123",
  "phone": "9876543212",
  "workshopName": "Ram Workshop",
  "workshopLocation": "Bangalore",
  "specialization": "Engine Repair",
  "experienceYears": 5
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully. Verification email sent.",
  "user": {
    "_id": "user_id",
    "email": "john@example.com",
    "role": "buyer",
    "active_status": "PENDING"
  }
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 2. Get User Profile
```
GET /api/auth/profile
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "buyer",
    "phone": "9876543210",
    "avatar": "https://cloudinary.com/image.jpg",
    "active_status": "APPROVED",
    "createdAt": "2026-04-01T10:00:00Z"
  }
}
```

### 3. Update User Profile
```
PUT /api/auth/profile
```

**Authentication**: Required ✓

**Request Body**:
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phone": "9876543211"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

### 4. Upload Avatar
```
POST /api/auth/avatar
```

**Authentication**: Required ✓

**Request**: Form Data
- `avatar`: Image file (max 5MB, JPG/PNG)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://cloudinary.com/avatar.jpg"
}
```

### 5. Change Password
```
POST /api/auth/change-password
```

**Authentication**: Required ✓

**Request Body**:
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Request Password Reset
```
POST /api/auth/forgot-password
```

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

### 7. Reset Password
```
POST /api/auth/reset-password/:token
```

**Request Body**:
```json
{
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Product Management APIs

### Base Route: `/api/products`

### 1. Create Product (Seller)
```
POST /api/products
```

**Authentication**: Required (Seller) ✓

**Request** (Form Data):
- `name`: string (required)
- `description`: string
- `category`: string (required)
- `price`: number (required)
- `stock`: number (required)
- `images`: file[] (max 5 files)

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Product created successfully. Awaiting admin approval.",
  "product": {
    "_id": "product_id",
    "name": "Spark Plug",
    "category": "Engine Parts",
    "price": 599,
    "stock": 50,
    "seller": "seller_id",
    "status": "PENDING",
    "images": ["https://cloudinary.com/img1.jpg"],
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

### 2. Get All Products (Public)
```
GET /api/products?page=1&limit=20&category=Engine&sort=price_asc&minPrice=100&maxPrice=5000
```

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `category`: string (optional)
- `search`: string (optional)
- `seller`: string (optional)
- `minPrice`: number (optional)
- `maxPrice`: number (optional)
- `sort`: string (options: `price_asc`, `price_desc`, `rating_desc`, `newest`)

**Response (200 OK)**:
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Spark Plug",
      "price": 599,
      "category": "Engine Parts",
      "images": ["https://cloudinary.com/img.jpg"],
      "rating": 4.5,
      "reviewCount": 12,
      "seller": { "shopName": "AutoParts Store" }
    }
  ],
  "totalCount": 45,
  "totalPages": 3,
  "currentPage": 1
}
```

### 3. Get Product Details
```
GET /api/products/:productId
```

**Response (200 OK)**:
```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "Spark Plug",
    "description": "High-quality spark plug for motorcycles",
    "category": "Engine Parts",
    "price": 599,
    "stock": 50,
    "images": ["https://cloudinary.com/img1.jpg", "https://cloudinary.com/img2.jpg"],
    "rating": 4.5,
    "reviewCount": 12,
    "seller": {
      "_id": "seller_id",
      "shopName": "AutoParts Store",
      "rating": 4.7
    },
    "reviews": [
      {
        "_id": "review_id",
        "buyer": "John Doe",
        "rating": 5,
        "comment": "Great product!",
        "createdAt": "2026-04-20T10:00:00Z"
      }
    ]
  }
}
```

### 4. Update Product (Seller)
```
PUT /api/products/:productId
```

**Authentication**: Required (Seller owns product) ✓

**Request Body**:
```json
{
  "name": "Premium Spark Plug",
  "price": 649,
  "stock": 45,
  "description": "Updated description"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { /* updated product object */ }
}
```

### 5. Delete Product (Seller)
```
DELETE /api/products/:productId
```

**Authentication**: Required (Seller owns product) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 6. Search Products by AI (Vector Search)
```
POST /api/products/search/ai
```

**Request Body**:
```json
{
  "query": "fast motorcycle with good suspension"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "results": [
    {
      "_id": "product_id",
      "name": "Sport Bike Suspension",
      "similarity": 0.92,
      "price": 2500
    }
  ]
}
```

---

## Order Management APIs

### Base Route: `/api/orders`

### 1. Create Order
```
POST /api/orders
```

**Authentication**: Required (Buyer) ✓

**Request Body**:
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 1,
      "price": 599
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "zipCode": "600001",
    "country": "India"
  },
  "paymentMethod": "card",
  "couponCode": "SAVE10" (optional)
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-20260429-001",
    "buyer": "buyer_id",
    "items": [
      {
        "product": "product_id",
        "quantity": 1,
        "price": 599
      }
    ],
    "totalAmount": 599,
    "shippingAddress": { /* address object */ },
    "status": "pending",
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

### 2. Get All Orders (Buyer)
```
GET /api/orders?status=pending&page=1&limit=10
```

**Authentication**: Required (Buyer) ✓

**Query Parameters**:
- `status`: string (options: `pending`, `confirmed`, `processing`, `ready_for_dispatch`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`)
- `page`: number
- `limit`: number

**Response (200 OK)**:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20260429-001",
      "totalAmount": 599,
      "status": "pending",
      "seller": "seller_id",
      "createdAt": "2026-04-29T10:00:00Z"
    }
  ],
  "totalCount": 5,
  "totalPages": 1
}
```

### 3. Get Order Details
```
GET /api/orders/:orderId
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-20260429-001",
    "buyer": { /* buyer object */ },
    "items": [
      {
        "product": { /* product details */ },
        "quantity": 1,
        "price": 599
      }
    ],
    "totalAmount": 599,
    "status": "pending",
    "shippingAddress": { /* address */ },
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2026-04-29T10:00:00Z"
      }
    ],
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

### 4. Update Order Status (Seller)
```
PUT /api/orders/:orderId/status
```

**Authentication**: Required (Seller) ✓

**Request Body**:
```json
{
  "status": "confirmed",
  "notes": "Order confirmed, will be shipped soon"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order status updated",
  "order": { /* updated order */ }
}
```

### 5. Cancel Order (Buyer)
```
POST /api/orders/:orderId/cancel
```

**Authentication**: Required (Buyer) ✓

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order cancelled successfully. Refund initiated.",
  "order": { /* cancelled order */ }
}
```

### 6. Generate Invoice
```
GET /api/orders/:orderId/invoice
```

**Authentication**: Required ✓

**Response**: PDF file download

---

## Cart APIs

### Base Route: `/api/cart`

### 1. Add to Cart
```
POST /api/cart
```

**Authentication**: Required ✓

**Request Body**:
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "_id": "cart_id",
    "items": [
      {
        "_id": "cart_item_id",
        "product": "product_id",
        "quantity": 2,
        "price": 599
      }
    ],
    "totalItems": 2,
    "totalPrice": 1198
  }
}
```

### 2. Get Cart
```
GET /api/cart
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "cart": {
    "_id": "cart_id",
    "items": [
      {
        "_id": "cart_item_id",
        "product": {
          "_id": "product_id",
          "name": "Spark Plug",
          "price": 599,
          "image": "https://cloudinary.com/img.jpg"
        },
        "quantity": 2
      }
    ],
    "totalItems": 2,
    "totalPrice": 1198
  }
}
```

### 3. Update Cart Item
```
PUT /api/cart/:cartItemId
```

**Authentication**: Required ✓

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "cart": { /* updated cart */ }
}
```

### 4. Remove from Cart
```
DELETE /api/cart/:cartItemId
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": { /* updated cart */ }
}
```

### 5. Clear Cart
```
DELETE /api/cart
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Seller Dashboard APIs

### Base Route: `/api/seller`

### 1. Get Dashboard KPIs
```
GET /api/seller/dashboard
```

**Authentication**: Required (Seller) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "dashboard": {
    "totalRevenue": 45000,
    "totalOrders": 25,
    "pendingOrders": 3,
    "averageOrderValue": 1800,
    "monthlyRevenue": 15000,
    "totalProducts": 50,
    "lowStockProducts": 5
  }
}
```

### 2. Get Revenue Chart Data
```
GET /api/seller/revenue?period=monthly
```

**Authentication**: Required (Seller) ✓

**Query Parameters**:
- `period`: string (options: `daily`, `weekly`, `monthly`)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-01",
      "revenue": 1200
    },
    {
      "date": "2026-04-02",
      "revenue": 1500
    }
  ]
}
```

### 3. Get Seller Orders
```
GET /api/seller/orders?status=pending&page=1
```

**Authentication**: Required (Seller) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-001",
      "buyer": { "firstName": "John", "email": "john@example.com" },
      "totalAmount": 599,
      "status": "pending",
      "createdAt": "2026-04-29T10:00:00Z"
    }
  ],
  "totalCount": 10,
  "totalPages": 1
}
```

### 4. Get Seller Products
```
GET /api/seller/products?page=1&limit=20
```

**Authentication**: Required (Seller) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Spark Plug",
      "price": 599,
      "stock": 50,
      "status": "APPROVED",
      "rating": 4.5,
      "sales": 25
    }
  ],
  "totalCount": 50,
  "totalPages": 3
}
```

### 5. Update Seller Profile
```
PUT /api/seller/profile
```

**Authentication**: Required (Seller) ✓

**Request Body**:
```json
{
  "shopName": "Premium AutoParts",
  "shopDescription": "High-quality motorcycle parts",
  "shopLocation": "Chennai"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated",
  "seller": { /* updated seller object */ }
}
```

### 6. Add Bank Details
```
POST /api/seller/bank-details
```

**Authentication**: Required (Seller) ✓

**Request Body**:
```json
{
  "accountName": "Seller Name",
  "accountNumber": "12345678901234",
  "ifscCode": "SBIN0001234",
  "bankName": "State Bank of India"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bank details saved securely"
}
```

---

## Mechanic Dashboard APIs

### Base Route: `/api/mechanic`

### 1. Get Mechanic Dashboard
```
GET /api/mechanic/dashboard
```

**Authentication**: Required (Mechanic) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "dashboard": {
    "totalRevenue": 25000,
    "totalServices": 15,
    "pendingServices": 2,
    "completedServices": 13,
    "averageServiceValue": 1667,
    "monthlyRevenue": 8000
  }
}
```

### 2. Get Service Orders
```
GET /api/mechanic/service-orders?status=pending
```

**Authentication**: Required (Mechanic) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "serviceOrders": [
    {
      "_id": "service_order_id",
      "serviceOrderNumber": "SO-001",
      "buyer": { "firstName": "John" },
      "service": { "name": "Engine Repair" },
      "bookedDate": "2026-04-30T10:00:00Z",
      "status": "SERVICE_ORDER_PLACED"
    }
  ]
}
```

### 3. Create Service
```
POST /api/mechanic/services
```

**Authentication**: Required (Mechanic) ✓

**Request Body**:
```json
{
  "name": "Engine Repair",
  "description": "Professional engine repair and diagnostics",
  "basePrice": 2000,
  "estimatedDuration": 120
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "service": {
    "_id": "service_id",
    "name": "Engine Repair",
    "basePrice": 2000,
    "mechanic": "mechanic_id",
    "status": "PENDING"
  }
}
```

---

## Admin Dashboard APIs

### Base Route: `/api/admin`

### 1. Get Admin Dashboard
```
GET /api/admin/dashboard
```

**Authentication**: Required (Admin) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "dashboard": {
    "totalUsers": 250,
    "totalBuyers": 200,
    "totalSellers": 30,
    "totalMechanics": 20,
    "totalOrders": 150,
    "totalRevenue": 500000,
    "pendingApprovals": 5,
    "newUsersThisMonth": 45
  }
}
```

### 2. Get Pending Approvals
```
GET /api/admin/pending-approvals?type=sellers
```

**Authentication**: Required (Admin) ✓

**Query Parameters**:
- `type`: string (options: `sellers`, `mechanics`, `products`)

**Response (200 OK)**:
```json
{
  "success": true,
  "pendingItems": [
    {
      "_id": "user_id",
      "firstName": "Jane",
      "shopName": "AutoParts Store",
      "type": "seller",
      "submittedAt": "2026-04-28T10:00:00Z",
      "documents": ["license.pdf", "identity.jpg"]
    }
  ],
  "totalCount": 5
}
```

### 3. Approve User (Seller/Mechanic)
```
POST /api/admin/approve-user/:userId
```

**Authentication**: Required (Admin) ✓

**Request Body**:
```json
{
  "notes": "Documents verified successfully"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User approved successfully",
  "user": {
    "_id": "user_id",
    "active_status": "APPROVED"
  }
}
```

### 4. Reject User
```
POST /api/admin/reject-user/:userId
```

**Authentication**: Required (Admin) ✓

**Request Body**:
```json
{
  "reason": "Invalid documents provided"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User rejected"
}
```

### 5. Approve Product
```
POST /api/admin/approve-product/:productId
```

**Authentication**: Required (Admin) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product approved",
  "product": {
    "_id": "product_id",
    "status": "APPROVED"
  }
}
```

### 6. Deactivate User
```
POST /api/admin/deactivate-user/:userId
```

**Authentication**: Required (Admin) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deactivated"
}
```

---

## Chat APIs

### Base Route: `/api/chat`

### 1. Get Chat Users (For Buyer)
```
GET /api/chat/users
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "seller_id",
      "firstName": "Jane",
      "shopName": "AutoParts Store",
      "avatar": "https://cloudinary.com/avatar.jpg"
    }
  ]
}
```

### 2. Get User Conversations
```
GET /api/chat/conversations
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "conversations": [
    {
      "chatId": "chat_id",
      "user": {
        "_id": "other_user_id",
        "firstName": "John",
        "shopName": "Shop Name"
      },
      "lastMessage": {
        "content": "Are you available?",
        "sender": "other_user_id",
        "createdAt": "2026-04-29T15:30:00Z"
      },
      "unreadCount": 2,
      "updatedAt": "2026-04-29T15:30:00Z"
    }
  ]
}
```

### 3. Get or Create Chat
```
GET /api/chat/:recipientId
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "chat": {
    "_id": "chat_id",
    "participants": ["buyer_id", "seller_id"],
    "messages": [
      {
        "_id": "msg_id",
        "sender": "buyer_id",
        "content": "Hi, are you available?",
        "read": true,
        "createdAt": "2026-04-29T15:00:00Z"
      }
    ]
  },
  "recipient": {
    "_id": "seller_id",
    "firstName": "Jane",
    "avatar": "https://cloudinary.com/avatar.jpg"
  }
}
```

---

## AI/Chatbot APIs

### Base Route: `/api/ai`

### 1. Send Message to AI Chatbot
```
POST /api/ai/chat
```

**Authentication**: Optional (public chatbot)

**Request Body**:
```json
{
  "message": "What motorcycle parts do you have?",
  "role": "buyer",
  "conversationId": "conv_id" (optional, for context)
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "response": "We have a wide range of motorcycle parts including spark plugs, brake pads, chain kits, etc. What specific part are you looking for?",
  "conversationId": "conv_id",
  "products": [
    {
      "_id": "product_id",
      "name": "Spark Plug",
      "price": 599
    }
  ]
}
```

### 2. AI Image Search
```
POST /api/ai/image-search
```

**Authentication**: Optional

**Request**: Form Data
- `image`: Image file

**Response (200 OK)**:
```json
{
  "success": true,
  "description": "This appears to be a motorcycle spark plug",
  "similarProducts": [
    {
      "_id": "product_id",
      "name": "Spark Plug",
      "similarity": 0.95,
      "price": 599
    }
  ]
}
```

---

## Review APIs

### Base Route: `/api/reviews`

### 1. Add Review
```
POST /api/reviews
```

**Authentication**: Required (Buyer) ✓

**Request Body**:
```json
{
  "productId": "product_id",
  "orderId": "order_id",
  "rating": 5,
  "comment": "Excellent product, highly recommended!"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {
    "_id": "review_id",
    "product": "product_id",
    "buyer": "buyer_id",
    "rating": 5,
    "comment": "Excellent product, highly recommended!",
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

### 2. Get Product Reviews
```
GET /api/reviews/product/:productId?sort=newest&page=1
```

**Query Parameters**:
- `sort`: string (options: `newest`, `helpful`, `rating_high`, `rating_low`)
- `page`: number
- `limit`: number

**Response (200 OK)**:
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "review_id",
      "buyer": { "firstName": "John", "avatar": "url" },
      "rating": 5,
      "comment": "Great product",
      "helpfulCount": 5,
      "unhelpfulCount": 0,
      "createdAt": "2026-04-29T10:00:00Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 12
}
```

### 3. Update Review
```
PUT /api/reviews/:reviewId
```

**Authentication**: Required (Review owner) ✓

**Request Body**:
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "review": { /* updated review */ }
}
```

### 4. Delete Review
```
DELETE /api/reviews/:reviewId
```

**Authentication**: Required (Review owner) ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 5. Mark Review as Helpful
```
POST /api/reviews/:reviewId/helpful
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "helpfulCount": 6
}
```

---

## Service Order APIs

### Base Route: `/api/service-orders`

### 1. Create Service Order
```
POST /api/service-orders
```

**Authentication**: Required (Buyer) ✓

**Request Body**:
```json
{
  "serviceId": "service_id",
  "mechanicId": "mechanic_id",
  "bookedDate": "2026-04-30",
  "bookedTime": "10:00 AM",
  "notes": "Engine making noise"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "serviceOrder": {
    "_id": "service_order_id",
    "serviceOrderNumber": "SO-001",
    "status": "SERVICE_ORDER_PLACED",
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

### 2. Get Service Orders (Buyer/Mechanic)
```
GET /api/service-orders?status=SERVICE_ORDER_PLACED
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "serviceOrders": [
    {
      "_id": "service_order_id",
      "serviceOrderNumber": "SO-001",
      "service": { "name": "Engine Repair" },
      "status": "SERVICE_ORDER_PLACED",
      "bookedDate": "2026-04-30T10:00:00Z"
    }
  ]
}
```

### 3. Update Service Order Status (Mechanic)
```
PUT /api/service-orders/:serviceOrderId/status
```

**Authentication**: Required (Mechanic) ✓

**Request Body**:
```json
{
  "status": "SERVICE_ORDER_CONFIRMED",
  "notes": "Confirmed, will start tomorrow"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "serviceOrder": { /* updated order */ }
}
```

---

## Delivery APIs

### Base Route: `/api/deliveries`

### 1. Get Deliveries (Delivery Agent)
```
GET /api/deliveries?status=assigned&page=1
```

**Authentication**: Required (Delivery Agent) ✓

**Query Parameters**:
- `status`: string (options: `assigned`, `in_transit`, `delivered`)

**Response (200 OK)**:
```json
{
  "success": true,
  "deliveries": [
    {
      "_id": "delivery_id",
      "order": { "orderNumber": "ORD-001" },
      "status": "in_transit",
      "destination": "123 Main St, Chennai"
    }
  ]
}
```

### 2. Update Delivery Status
```
PUT /api/deliveries/:deliveryId/status
```

**Authentication**: Required (Delivery Agent) ✓

**Request Body**:
```json
{
  "status": "delivered",
  "deliveryTime": "2026-04-29T15:30:00Z"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "delivery": { /* updated delivery */ }
}
```

---

## Notification APIs

### Base Route: `/api/notifications`

### 1. Get Notifications
```
GET /api/notifications?limit=20
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notif_id",
      "type": "order_confirmed",
      "message": "Your order ORD-001 has been confirmed",
      "read": false,
      "createdAt": "2026-04-29T14:00:00Z"
    }
  ],
  "unreadCount": 3
}
```

### 2. Mark Notification as Read
```
PUT /api/notifications/:notificationId/read
```

**Authentication**: Required ✓

**Response (200 OK)**:
```json
{
  "success": true,
  "notification": { /* updated notification */ }
}
```

---

## Report APIs

### Base Route: `/api/reports`

### 1. Create Report
```
POST /api/reports
```

**Authentication**: Required ✓

**Request Body**:
```json
{
  "reportType": "product",
  "targetId": "product_id",
  "reason": "inappropriate_content",
  "description": "Product contains explicit content"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "report": {
    "_id": "report_id",
    "status": "pending",
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

---

## Return APIs

### Base Route: `/api/returns`

### 1. Create Return Request
```
POST /api/returns
```

**Authentication**: Required (Buyer) ✓

**Request Body**:
```json
{
  "orderId": "order_id",
  "reason": "damaged",
  "description": "Product arrived damaged"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "return": {
    "_id": "return_id",
    "status": "PENDING",
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

---

## Health Check

### API Health Status
```
GET /api/health
```

**Response (200 OK)**:
```json
{
  "status": "OK",
  "message": "Finding Moto API is running",
  "database": "connected"
}
```

---

## Socket.IO Events (Real-time)

### Chat Events
- **send_message**: Send chat message
- **receive_message**: Receive chat message
- **message_read**: Mark message as read
- **typing**: User typing indicator
- **online_users**: Get list of online users

### Notification Events
- **new_notification**: Receive new notification
- **status_update**: Order/service status update

### Connection Events
- **connect**: Socket connected
- **disconnect**: Socket disconnected

---

## Rate Limiting

- **Public endpoints**: 100 requests/15 minutes
- **Authenticated endpoints**: 300 requests/15 minutes
- **Auth endpoints**: 5 requests/15 minutes (login, register)

---

## Pagination

Most list endpoints support pagination:
- `page`: Current page (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response includes**:
- `totalCount`: Total number of items
- `totalPages`: Total number of pages
- `currentPage`: Current page number

---

## File Upload Guidelines

### Image Upload Requirements
- **Accepted Formats**: JPG, PNG, WebP
- **Max Size**: 5MB per file
- **Max Files**: 5 per product
- **Storage**: Cloudinary CDN

### Upload Response
- **Returns**: Secure HTTPS URL
- **Auto-optimization**: Format and quality optimization applied

---

## Version & Support

**API Version**: 1.0  
**Last Updated**: April 29, 2026  
**Status**: Production Ready  

For issues or questions, contact: `support@findingmoto.com`
