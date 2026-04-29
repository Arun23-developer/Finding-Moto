# API Integration Examples

**Finding Moto - Real-World API Usage Examples**  
**Date**: April 29, 2026

---

## Table of Contents
1. [User Registration & Login](#user-registration--login)
2. [Product Management](#product-management)
3. [Shopping Cart & Orders](#shopping-cart--orders)
4. [Real-time Chat](#real-time-chat)
5. [AI Chatbot Integration](#ai-chatbot-integration)
6. [Service Booking](#service-booking)
7. [Admin Operations](#admin-operations)

---

## User Registration & Login

### Example 1: Buyer Registration

**Request**:
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "role": "buyer",
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh@example.com",
  "password": "SecurePass@123",
  "phone": "9876543210"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully. Verification email sent.",
  "user": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "email": "rajesh@example.com",
    "role": "buyer",
    "phone": "9876543210",
    "active_status": "APPROVED",
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

### Example 2: Seller Registration

**Request**:
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "role": "seller",
  "firstName": "Priya",
  "lastName": "Sharma",
  "email": "priya@autoparts.com",
  "password": "BusinessPass@123",
  "phone": "9876543211",
  "shopName": "Premium AutoParts",
  "shopDescription": "High-quality motorcycle and spare parts",
  "shopLocation": "Chennai, Tamil Nadu",
  "sellerSpecializations": ["Engine Parts", "Suspension", "Brakes"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration submitted for approval. You'll be notified once approved.",
  "user": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "role": "seller",
    "email": "priya@autoparts.com",
    "shopName": "Premium AutoParts",
    "active_status": "PENDING"
  }
}
```

### Example 3: Login

**Request**:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rajesh@example.com",
  "password": "SecurePass@123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTdiOGM5ZDFlMmYzZzRoNWk2ajdrOCIsImlhdCI6MTcxOTcyODAwMCwiZXhwIjoxNzIwMzMyODAwfQ.abc123def456",
  "user": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "email": "rajesh@example.com",
    "role": "buyer",
    "avatar": "https://res.cloudinary.com/finding-moto/image/upload/avatar.jpg"
  }
}
```

### Example 4: Update Profile

**Request**:
```bash
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "phone": "9876543212"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "phone": "9876543212",
    "updatedAt": "2026-04-29T11:00:00Z"
  }
}
```

### Example 5: Upload Avatar

**Request**:
```bash
POST http://localhost:5000/api/auth/avatar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

avatar: [Binary Image Data]
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://res.cloudinary.com/finding-moto/image/upload/v1619865600/avatars/64a7b8c9d1e2f3g4h5i6j7k8.jpg"
}
```

---

## Product Management

### Example 1: Create Product (Seller)

**Request**:
```bash
POST http://localhost:5000/api/products
Authorization: Bearer <seller_token>
Content-Type: multipart/form-data

name: Spark Plug NGK
description: High performance spark plug for motorcycles
category: Engine Parts
price: 599
stock: 100
images: [image1.jpg, image2.jpg, image3.jpg]
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Product created successfully. Awaiting admin approval.",
  "product": {
    "_id": "64a7c8d9e1f2g3h4i5j6k7l8",
    "name": "Spark Plug NGK",
    "description": "High performance spark plug for motorcycles",
    "category": "Engine Parts",
    "price": 599,
    "stock": 100,
    "seller": "64a7b8c9d1e2f3g4h5i6j7k9",
    "status": "PENDING",
    "images": [
      "https://res.cloudinary.com/finding-moto/image/upload/v1619865600/products/img1.jpg",
      "https://res.cloudinary.com/finding-moto/image/upload/v1619865600/products/img2.jpg"
    ],
    "createdAt": "2026-04-29T12:00:00Z"
  }
}
```

### Example 2: Browse Products (Public)

**Request**:
```bash
GET http://localhost:5000/api/products?page=1&limit=20&category=Engine%20Parts&minPrice=400&maxPrice=1000&sort=price_asc
```

**Response (200 OK)**:
```json
{
  "success": true,
  "products": [
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l8",
      "name": "Spark Plug NGK",
      "category": "Engine Parts",
      "price": 599,
      "stock": 100,
      "rating": 4.5,
      "reviewCount": 12,
      "images": ["https://res.cloudinary.com/finding-moto/image/upload/products/img1.jpg"],
      "seller": {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
        "shopName": "Premium AutoParts",
        "rating": 4.7
      }
    },
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l9",
      "name": "Premium Oil Filter",
      "category": "Engine Parts",
      "price": 799,
      "stock": 50,
      "rating": 4.8,
      "reviewCount": 8,
      "images": ["https://res.cloudinary.com/finding-moto/image/upload/products/img2.jpg"],
      "seller": {
        "_id": "64a7b8c9d1e2f3g4h5i6j7l0",
        "shopName": "BikeWorld",
        "rating": 4.6
      }
    }
  ],
  "totalCount": 45,
  "totalPages": 3,
  "currentPage": 1
}
```

### Example 3: View Product Details

**Request**:
```bash
GET http://localhost:5000/api/products/64a7c8d9e1f2g3h4i5j6k7l8
```

**Response (200 OK)**:
```json
{
  "success": true,
  "product": {
    "_id": "64a7c8d9e1f2g3h4i5j6k7l8",
    "name": "Spark Plug NGK",
    "description": "High performance spark plug for motorcycles",
    "category": "Engine Parts",
    "price": 599,
    "stock": 100,
    "rating": 4.5,
    "reviewCount": 12,
    "images": [
      "https://res.cloudinary.com/finding-moto/image/upload/products/img1.jpg",
      "https://res.cloudinary.com/finding-moto/image/upload/products/img2.jpg"
    ],
    "seller": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "shopName": "Premium AutoParts",
      "rating": 4.7,
      "avatar": "https://res.cloudinary.com/finding-moto/image/upload/avatars/seller.jpg"
    },
    "reviews": [
      {
        "_id": "64a7d8c9e1f2g3h4i5j6k7l8",
        "buyer": "Rajesh Kumar",
        "rating": 5,
        "comment": "Excellent product, very reliable!",
        "helpfulCount": 5,
        "createdAt": "2026-04-20T10:00:00Z"
      }
    ]
  }
}
```

### Example 4: Search Products by AI

**Request**:
```bash
POST http://localhost:5000/api/products/search/ai
Content-Type: application/json

{
  "query": "best motorcycle suspension for smooth ride"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "results": [
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l0",
      "name": "Premium Suspension Kit",
      "price": 8500,
      "similarity": 0.94,
      "seller": "Premium AutoParts"
    },
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l1",
      "name": "Adjustable Shock Absorber",
      "price": 6200,
      "similarity": 0.88,
      "seller": "BikeWorld"
    }
  ]
}
```

---

## Shopping Cart & Orders

### Example 1: Add Product to Cart

**Request**:
```bash
POST http://localhost:5000/api/cart
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "productId": "64a7c8d9e1f2g3h4i5j6k7l8",
  "quantity": 2
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "_id": "64a7e8c9f1g2h3i4j5k6l7m8",
    "items": [
      {
        "_id": "64a7e8c9f1g2h3i4j5k6l7m9",
        "product": "64a7c8d9e1f2g3h4i5j6k7l8",
        "quantity": 2,
        "price": 599
      }
    ],
    "totalItems": 2,
    "totalPrice": 1198
  }
}
```

### Example 2: View Cart

**Request**:
```bash
GET http://localhost:5000/api/cart
Authorization: Bearer <buyer_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "cart": {
    "_id": "64a7e8c9f1g2h3i4j5k6l7m8",
    "items": [
      {
        "_id": "64a7e8c9f1g2h3i4j5k6l7m9",
        "product": {
          "_id": "64a7c8d9e1f2g3h4i5j6k7l8",
          "name": "Spark Plug NGK",
          "price": 599,
          "image": "https://res.cloudinary.com/finding-moto/image/upload/products/img1.jpg"
        },
        "quantity": 2
      }
    ],
    "totalItems": 2,
    "totalPrice": 1198
  }
}
```

### Example 3: Create Order from Cart

**Request**:
```bash
POST http://localhost:5000/api/orders
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "64a7c8d9e1f2g3h4i5j6k7l8",
      "quantity": 2,
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
  "couponCode": "SAVE10"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "64a7f8c9f1g2h3i4j5k6l7m8",
    "orderNumber": "ORD-20260429-001",
    "buyer": "64a7b8c9d1e2f3g4h5i6j7k8",
    "items": [
      {
        "product": "64a7c8d9e1f2g3h4i5j6k7l8",
        "quantity": 2,
        "price": 599
      }
    ],
    "totalAmount": 1180,
    "discount": 18,
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "zipCode": "600001",
      "country": "India"
    },
    "status": "pending",
    "createdAt": "2026-04-29T13:00:00Z"
  }
}
```

### Example 4: Seller Confirms Order

**Request**:
```bash
PUT http://localhost:5000/api/orders/64a7f8c9f1g2h3i4j5k6l7m8/status
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Order confirmed, will ship tomorrow morning"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "_id": "64a7f8c9f1g2h3i4j5k6l7m8",
    "orderNumber": "ORD-20260429-001",
    "status": "confirmed",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2026-04-29T13:00:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2026-04-29T13:15:00Z"
      }
    ]
  }
}
```

---

## Real-time Chat

### Example 1: Get Chat Users

**Request**:
```bash
GET http://localhost:5000/api/chat/users
Authorization: Bearer <buyer_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "firstName": "Priya",
      "lastName": "Sharma",
      "shopName": "Premium AutoParts",
      "avatar": "https://res.cloudinary.com/finding-moto/image/upload/avatars/seller.jpg",
      "role": "seller"
    }
  ]
}
```

### Example 2: Start Chat and Send Message (WebSocket)

**JavaScript Client Code**:
```javascript
// Connect to Socket.IO
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join conversation
socket.emit('join_chat', {
  recipientId: '64a7b8c9d1e2f3g4h5i6j7k9',
  conversationId: 'conv_id'
});

// Send message
socket.emit('send_message', {
  conversationId: 'conv_id',
  content: 'Hi! Do you have spark plugs in stock?',
  sender: 'current_user_id'
});

// Receive message
socket.on('receive_message', (data) => {
  console.log('New message from:', data.sender);
  console.log('Content:', data.content);
  console.log('Time:', data.createdAt);
});

// User typing indicator
socket.emit('typing', {
  conversationId: 'conv_id',
  isTyping: true
});
```

### Example 3: Get Chat History

**Request**:
```bash
GET http://localhost:5000/api/chat/64a7b8c9d1e2f3g4h5i6j7k9
Authorization: Bearer <buyer_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "chat": {
    "_id": "64a7g8c9f1g2h3i4j5k6l7m8",
    "participants": ["64a7b8c9d1e2f3g4h5i6j7k8", "64a7b8c9d1e2f3g4h5i6j7k9"],
    "messages": [
      {
        "_id": "msg_1",
        "sender": "64a7b8c9d1e2f3g4h5i6j7k8",
        "content": "Hi! Do you have spark plugs in stock?",
        "read": true,
        "createdAt": "2026-04-29T14:00:00Z"
      },
      {
        "_id": "msg_2",
        "sender": "64a7b8c9d1e2f3g4h5i6j7k9",
        "content": "Yes! We have NGK spark plugs available. Price is 599 per piece.",
        "read": true,
        "createdAt": "2026-04-29T14:05:00Z"
      }
    ]
  },
  "recipient": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "firstName": "Priya",
    "shopName": "Premium AutoParts",
    "avatar": "https://res.cloudinary.com/finding-moto/image/upload/avatars/seller.jpg"
  }
}
```

---

## AI Chatbot Integration

### Example 1: Ask Chatbot for Product Recommendations

**Request**:
```bash
POST http://localhost:5000/api/ai/chat
Content-Type: application/json

{
  "message": "I have a 2020 Honda CB350. What maintenance parts should I get?",
  "role": "buyer"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "response": "For a 2020 Honda CB350, here are essential maintenance parts:\n\n1. **Engine Oil & Filter** - Change every 3,000 km\n2. **Spark Plugs** - Replace every 8,000 km\n3. **Air Filter** - Clean monthly, replace every 10,000 km\n4. **Brake Pads** - Replace when worn\n5. **Chain Kit** - Lubricate regularly, replace if damaged\n\nWould you like me to help you find any of these products in our marketplace?",
  "conversationId": "conv_123",
  "suggestedProducts": [
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l8",
      "name": "Honda CB350 Spark Plug Set",
      "price": 399,
      "url": "/products/64a7c8d9e1f2g3h4i5j6k7l8"
    },
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l9",
      "name": "Premium Motorcycle Chain Kit",
      "price": 1299,
      "url": "/products/64a7c8d9e1f2g3h4i5j6k7l9"
    }
  ]
}
```

### Example 2: AI Image Search

**Request**:
```bash
POST http://localhost:5000/api/ai/image-search
Content-Type: multipart/form-data

image: [Binary Image of Motorcycle Part]
```

**Response (200 OK)**:
```json
{
  "success": true,
  "description": "This appears to be a motorcycle brake disc rotor",
  "similarProducts": [
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l0",
      "name": "Premium Brake Disc Rotor 280mm",
      "price": 899,
      "similarity": 0.96,
      "url": "/products/64a7c8d9e1f2g3h4i5j6k7l0"
    },
    {
      "_id": "64a7c8d9e1f2g3h4i5j6k7l1",
      "name": "Stainless Steel Brake Rotor",
      "price": 1099,
      "similarity": 0.92,
      "url": "/products/64a7c8d9e1f2g3h4i5j6k7l1"
    }
  ]
}
```

---

## Service Booking

### Example 1: Create Service Order (Mechanic Service)

**Request**:
```bash
POST http://localhost:5000/api/service-orders
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "serviceId": "64a7h8c9f1g2h3i4j5k6l7m8",
  "mechanicId": "64a7i8c9f1g2h3i4j5k6l7m8",
  "bookedDate": "2026-04-30",
  "bookedTime": "10:00 AM",
  "notes": "Engine is making a knocking sound, please diagnose"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "serviceOrder": {
    "_id": "64a7j8c9f1g2h3i4j5k6l7m8",
    "serviceOrderNumber": "SO-20260429-001",
    "service": {
      "_id": "64a7h8c9f1g2h3i4j5k6l7m8",
      "name": "Engine Diagnostics & Repair"
    },
    "mechanic": {
      "_id": "64a7i8c9f1g2h3i4j5k6l7m8",
      "workshopName": "Ram Workshop"
    },
    "buyer": "64a7b8c9d1e2f3g4h5i6j7k8",
    "bookedDate": "2026-04-30",
    "bookedTime": "10:00 AM",
    "status": "SERVICE_ORDER_PLACED",
    "createdAt": "2026-04-29T15:00:00Z"
  }
}
```

### Example 2: Mechanic Confirms Service Order

**Request**:
```bash
PUT http://localhost:5000/api/service-orders/64a7j8c9f1g2h3i4j5k6l7m8/status
Authorization: Bearer <mechanic_token>
Content-Type: application/json

{
  "status": "SERVICE_ORDER_CONFIRMED",
  "notes": "Confirmed for tomorrow 10 AM. Estimated time: 2 hours"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "serviceOrder": {
    "_id": "64a7j8c9f1g2h3i4j5k6l7m8",
    "serviceOrderNumber": "SO-20260429-001",
    "status": "SERVICE_ORDER_CONFIRMED",
    "timeline": [
      {
        "status": "SERVICE_ORDER_PLACED",
        "timestamp": "2026-04-29T15:00:00Z"
      },
      {
        "status": "SERVICE_ORDER_CONFIRMED",
        "timestamp": "2026-04-29T15:15:00Z"
      }
    ]
  }
}
```

---

## Admin Operations

### Example 1: Get Pending Approvals

**Request**:
```bash
GET http://localhost:5000/api/admin/pending-approvals?type=sellers
Authorization: Bearer <admin_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "pendingItems": [
    {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "firstName": "Priya",
      "lastName": "Sharma",
      "email": "priya@autoparts.com",
      "shopName": "Premium AutoParts",
      "shopLocation": "Chennai",
      "shopDescription": "High-quality motorcycle parts",
      "type": "seller",
      "submittedAt": "2026-04-28T10:00:00Z",
      "documents": [
        "gst_certificate.pdf",
        "business_license.jpg",
        "identity_proof.jpg"
      ]
    }
  ],
  "totalCount": 1
}
```

### Example 2: Approve Seller

**Request**:
```bash
POST http://localhost:5000/api/admin/approve-user/64a7b8c9d1e2f3g4h5i6j7k9
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Documents verified. Shop details look legitimate. Approved!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User approved successfully",
  "user": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "firstName": "Priya",
    "email": "priya@autoparts.com",
    "role": "seller",
    "active_status": "APPROVED",
    "approvedAt": "2026-04-29T16:00:00Z"
  }
}
```

### Example 3: Get Dashboard Analytics

**Request**:
```bash
GET http://localhost:5000/api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "dashboard": {
    "totalUsers": 250,
    "userBreakdown": {
      "buyers": 200,
      "sellers": 30,
      "mechanics": 15,
      "admins": 5
    },
    "totalOrders": 150,
    "totalRevenue": 500000,
    "revenueThisMonth": 125000,
    "pendingApprovals": {
      "users": 3,
      "products": 5
    },
    "newUsersThisMonth": 45,
    "activeListings": 450,
    "topSellers": [
      {
        "shopName": "Premium AutoParts",
        "revenue": 45000,
        "orders": 50
      }
    ]
  }
}
```

---

## Error Handling Examples

### Example 1: Invalid Credentials

**Request**:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrong@example.com",
  "password": "wrong_password"
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 400
}
```

### Example 2: Insufficient Stock

**Request**:
```bash
POST http://localhost:5000/api/orders
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "64a7c8d9e1f2g3h4i5j6k7l8",
      "quantity": 150,
      "price": 599
    }
  ],
  "shippingAddress": { /* ... */ }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Insufficient stock. Only 100 items available, but 150 requested.",
  "statusCode": 400,
  "availableStock": 100
}
```

### Example 3: Unauthorized Access

**Request**:
```bash
PUT http://localhost:5000/api/products/64a7c8d9e1f2g3h4i5j6k7l8
Authorization: Bearer <different_seller_token>
Content-Type: application/json

{
  "price": 699
}
```

**Response (403 Forbidden)**:
```json
{
  "success": false,
  "message": "You are not authorized to update this product",
  "statusCode": 403
}
```

### Example 4: Resource Not Found

**Request**:
```bash
GET http://localhost:5000/api/products/invalid_product_id
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "message": "Product not found",
  "statusCode": 404
}
```

### Example 5: Database Connection Error

**Request**:
```bash
GET http://localhost:5000/api/products
```

**Response (503 Service Unavailable)**:
```json
{
  "success": false,
  "message": "Database unavailable. Please try again shortly.",
  "statusCode": 503
}
```

---

## Best Practices

### 1. Always Include Authorization Headers
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Handle Errors Gracefully
```javascript
try {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.message);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Network Error:', error);
}
```

### 3. Use Pagination for Large Lists
```javascript
// First request
GET /api/products?page=1&limit=20

// Next request
GET /api/products?page=2&limit=20
```

### 4. Store Token Securely
```javascript
// Save token
localStorage.setItem('token', response.token);

// Retrieve token
const token = localStorage.getItem('token');

// Remove token on logout
localStorage.removeItem('token');
```

### 5. Implement Rate Limiting
```javascript
const rateLimit = {
  maxRequests: 300,
  timeWindow: 900000 // 15 minutes
};
```

---

**Last Updated**: April 29, 2026  
**Document Version**: 1.0
