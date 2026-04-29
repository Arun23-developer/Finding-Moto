# API Endpoints Quick Reference

**Finding Moto - Complete Endpoint List**  
**Date**: April 29, 2026

---

## Authentication Endpoints

### `/api/auth`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/auth/register` | ❌ No | Register new user (buyer/seller/mechanic) |
| POST | `/api/auth/login` | ❌ No | Login with email and password |
| POST | `/api/auth/google` | ❌ No | Google OAuth login |
| POST | `/api/auth/logout` | ✅ Yes | Logout user |
| GET | `/api/auth/profile` | ✅ Yes | Get current user profile |
| PUT | `/api/auth/profile` | ✅ Yes | Update user profile |
| POST | `/api/auth/avatar` | ✅ Yes | Upload user avatar |
| POST | `/api/auth/change-password` | ✅ Yes | Change password |
| POST | `/api/auth/forgot-password` | ❌ No | Request password reset |
| POST | `/api/auth/reset-password/:token` | ❌ No | Reset password with token |

---

## Product Management Endpoints

### `/api/products`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/products` | ✅ Yes (Seller) | Create new product |
| GET | `/api/products` | ❌ No | Get all products (with filters) |
| GET | `/api/products/:productId` | ❌ No | Get product details |
| PUT | `/api/products/:productId` | ✅ Yes (Seller) | Update product |
| DELETE | `/api/products/:productId` | ✅ Yes (Seller) | Delete product |
| POST | `/api/products/search/ai` | ❌ No | AI semantic search |
| GET | `/api/public/products/featured` | ❌ No | Get featured products |

---

## Order Management Endpoints

### `/api/orders`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/orders` | ✅ Yes (Buyer) | Create new order |
| GET | `/api/orders` | ✅ Yes (Buyer) | Get buyer's orders |
| GET | `/api/orders/:orderId` | ✅ Yes | Get order details |
| PUT | `/api/orders/:orderId/status` | ✅ Yes (Seller) | Update order status |
| POST | `/api/orders/:orderId/cancel` | ✅ Yes (Buyer) | Cancel order |
| GET | `/api/orders/:orderId/invoice` | ✅ Yes | Download invoice PDF |
| POST | `/api/orders/:orderId/confirm` | ✅ Yes (Seller) | Confirm order |

---

## Cart Endpoints

### `/api/cart`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/cart` | ✅ Yes | Add item to cart |
| GET | `/api/cart` | ✅ Yes | Get cart items |
| PUT | `/api/cart/:cartItemId` | ✅ Yes | Update cart item quantity |
| DELETE | `/api/cart/:cartItemId` | ✅ Yes | Remove item from cart |
| DELETE | `/api/cart` | ✅ Yes | Clear entire cart |
| POST | `/api/cart/coupon` | ✅ Yes | Apply coupon code |

---

## Seller Dashboard Endpoints

### `/api/seller`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/seller/dashboard` | ✅ Yes (Seller) | Get seller dashboard KPIs |
| GET | `/api/seller/orders` | ✅ Yes (Seller) | Get seller's orders |
| GET | `/api/seller/products` | ✅ Yes (Seller) | Get seller's products |
| GET | `/api/seller/revenue` | ✅ Yes (Seller) | Get revenue analytics |
| GET | `/api/seller/revenue/chart` | ✅ Yes (Seller) | Get revenue chart data |
| PUT | `/api/seller/profile` | ✅ Yes (Seller) | Update seller profile |
| POST | `/api/seller/bank-details` | ✅ Yes (Seller) | Add bank details |
| GET | `/api/seller/payouts` | ✅ Yes (Seller) | Get payout history |
| POST | `/api/seller/request-payout` | ✅ Yes (Seller) | Request payout |
| GET | `/api/seller/reviews` | ✅ Yes (Seller) | Get product reviews |

---

## Mechanic Dashboard Endpoints

### `/api/mechanic`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/mechanic/dashboard` | ✅ Yes (Mechanic) | Get mechanic dashboard |
| GET | `/api/mechanic/service-orders` | ✅ Yes (Mechanic) | Get service orders |
| POST | `/api/mechanic/services` | ✅ Yes (Mechanic) | Create service |
| GET | `/api/mechanic/services` | ✅ Yes (Mechanic) | Get mechanic's services |
| PUT | `/api/mechanic/services/:serviceId` | ✅ Yes (Mechanic) | Update service |
| PUT | `/api/mechanic/profile` | ✅ Yes (Mechanic) | Update profile |
| GET | `/api/mechanic/earnings` | ✅ Yes (Mechanic) | Get earnings report |

---

## Admin Dashboard Endpoints

### `/api/admin`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/admin/dashboard` | ✅ Yes (Admin) | Get admin dashboard |
| GET | `/api/admin/pending-approvals` | ✅ Yes (Admin) | Get pending user approvals |
| POST | `/api/admin/approve-user/:userId` | ✅ Yes (Admin) | Approve user (seller/mechanic) |
| POST | `/api/admin/reject-user/:userId` | ✅ Yes (Admin) | Reject user |
| GET | `/api/admin/products/pending` | ✅ Yes (Admin) | Get pending products |
| POST | `/api/admin/approve-product/:productId` | ✅ Yes (Admin) | Approve product |
| POST | `/api/admin/reject-product/:productId` | ✅ Yes (Admin) | Reject product |
| GET | `/api/admin/users` | ✅ Yes (Admin) | Get all users |
| POST | `/api/admin/deactivate-user/:userId` | ✅ Yes (Admin) | Deactivate user |
| POST | `/api/admin/activate-user/:userId` | ✅ Yes (Admin) | Activate user |
| DELETE | `/api/admin/delete-user/:userId` | ✅ Yes (Admin) | Delete user |
| GET | `/api/admin/reports` | ✅ Yes (Admin) | Get reports |
| GET | `/api/admin/flagged-content` | ✅ Yes (Admin) | Get flagged content |
| POST | `/api/admin/remove-content/:contentId` | ✅ Yes (Admin) | Remove flagged content |

---

## Chat Endpoints

### `/api/chat`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/chat/users` | ✅ Yes | Get available chat users |
| GET | `/api/chat/conversations` | ✅ Yes | Get user's conversations |
| GET | `/api/chat/:recipientId` | ✅ Yes | Get or create chat |
| GET | `/api/chat/:chatId/messages` | ✅ Yes | Get chat messages |
| POST | `/api/chat/:chatId/message` | ✅ Yes | Send message (WebSocket) |
| PUT | `/api/chat/message/:messageId/read` | ✅ Yes | Mark message as read |
| POST | `/api/chat/:userId/block` | ✅ Yes | Block user |
| DELETE | `/api/chat/:userId/block` | ✅ Yes | Unblock user |

---

## AI/Chatbot Endpoints

### `/api/ai`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/ai/chat` | ❌ No (Optional) | Send message to AI chatbot |
| POST | `/api/ai/image-search` | ❌ No | Search by image upload |
| GET | `/api/ai/conversation/:conversationId` | ✅ Yes | Get conversation history |
| POST | `/api/ai/generate-description` | ✅ Yes (Seller) | Generate product description |

---

## Review Endpoints

### `/api/reviews`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/reviews` | ✅ Yes (Buyer) | Add product review |
| GET | `/api/reviews/product/:productId` | ❌ No | Get product reviews |
| PUT | `/api/reviews/:reviewId` | ✅ Yes (Owner) | Update review |
| DELETE | `/api/reviews/:reviewId` | ✅ Yes (Owner) | Delete review |
| POST | `/api/reviews/:reviewId/helpful` | ✅ Yes | Mark review as helpful |
| POST | `/api/reviews/:reviewId/unhelpful` | ✅ Yes | Mark review as unhelpful |
| POST | `/api/reviews/:reviewId/report` | ✅ Yes | Report inappropriate review |

---

## Service Order Endpoints

### `/api/service-orders`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/service-orders` | ✅ Yes (Buyer) | Create service order |
| GET | `/api/service-orders` | ✅ Yes | Get service orders |
| GET | `/api/service-orders/:serviceOrderId` | ✅ Yes | Get service order details |
| PUT | `/api/service-orders/:serviceOrderId/status` | ✅ Yes (Mechanic) | Update service order status |
| POST | `/api/service-orders/:serviceOrderId/cancel` | ✅ Yes | Cancel service order |
| POST | `/api/service-orders/:serviceOrderId/payment` | ✅ Yes (Buyer) | Create payment request |

---

## Delivery Endpoints

### `/api/deliveries`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/deliveries` | ✅ Yes (Agent) | Get delivery agent's deliveries |
| GET | `/api/deliveries/:deliveryId` | ✅ Yes | Get delivery details |
| PUT | `/api/deliveries/:deliveryId/status` | ✅ Yes (Agent) | Update delivery status |
| GET | `/api/deliveries/order/:orderId` | ✅ Yes | Get order delivery info |
| POST | `/api/deliveries/assign` | ✅ Yes (Admin) | Assign delivery agent |

---

## Notification Endpoints

### `/api/notifications`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/notifications` | ✅ Yes | Get user notifications |
| PUT | `/api/notifications/:notificationId/read` | ✅ Yes | Mark notification as read |
| PUT | `/api/notifications/read-all` | ✅ Yes | Mark all as read |
| DELETE | `/api/notifications/:notificationId` | ✅ Yes | Delete notification |
| GET | `/api/notifications/unread-count` | ✅ Yes | Get unread count |

---

## Report Endpoints

### `/api/reports`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/reports` | ✅ Yes | Create content report |
| GET | `/api/reports` | ✅ Yes (Admin) | Get reports |
| PUT | `/api/reports/:reportId/status` | ✅ Yes (Admin) | Update report status |

---

## Return Endpoints

### `/api/returns`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| POST | `/api/returns` | ✅ Yes (Buyer) | Create return request |
| GET | `/api/returns` | ✅ Yes | Get return requests |
| GET | `/api/returns/:returnId` | ✅ Yes | Get return details |
| PUT | `/api/returns/:returnId/status` | ✅ Yes (Seller) | Update return status |
| POST | `/api/returns/:returnId/approve` | ✅ Yes (Seller) | Approve return |
| POST | `/api/returns/:returnId/reject` | ✅ Yes (Seller) | Reject return |

---

## Public Endpoints

### `/api/public`

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/public/products` | ❌ No | Browse products publicly |
| GET | `/api/public/sellers` | ❌ No | Browse sellers |
| GET | `/api/public/mechanics` | ❌ No | Browse mechanics |
| GET | `/api/public/services` | ❌ No | Browse services |
| POST | `/api/public/chat` | ❌ No | Public chatbot access |

---

## Health & System Endpoints

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/health` | ❌ No | API health check |
| GET | `/api/health/database` | ❌ No | Database connection status |

---

## Query Parameters Guide

### Pagination
```
?page=1&limit=20
```

### Sorting
```
?sort=price_asc
?sort=price_desc
?sort=rating_desc
?sort=newest
```

### Filtering (Products)
```
?category=Engine%20Parts
?minPrice=100&maxPrice=5000
?seller=seller_id
?status=APPROVED
```

### Filtering (Orders)
```
?status=pending
?status=confirmed
?status=shipped
?status=delivered
```

### Filtering (Services)
```
?status=SERVICE_ORDER_PLACED
?status=SERVICE_IN_PROGRESS
?status=SERVICE_COMPLETED
```

---

## Common Request Headers

### Required for Authenticated Requests
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### For File Uploads
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

---

## Response Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 204 | No Content | Success with no response body |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate/conflict |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Database/service down |

---

## Authentication Methods

### JWT Token
```
Header: Authorization: Bearer <token>
```

### Google OAuth
```
POST /api/auth/google
Body: { token: "<google_id_token>" }
```

---

## Rate Limiting

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Auth (login, register) | 5 req | 15 min |
| Public endpoints | 100 req | 15 min |
| Authenticated endpoints | 300 req | 15 min |

---

## WebSocket Events

### Chat
- `send_message`
- `receive_message`
- `typing`
- `user_online`
- `user_offline`

### Notifications
- `new_notification`
- `order_status_update`
- `service_update`

### Connection
- `connect`
- `disconnect`
- `error`

---

## File Upload Limits

| File Type | Max Size | Max Count |
|-----------|----------|-----------|
| Product Image | 5 MB | 5 files |
| Avatar | 5 MB | 1 file |
| Banner | 5 MB | 1 file |
| Document | 10 MB | 5 files |

---

## Supported Image Formats
- JPG / JPEG
- PNG
- WebP

---

**Last Updated**: April 29, 2026  
**Status**: Production Ready  
**Version**: 1.0
