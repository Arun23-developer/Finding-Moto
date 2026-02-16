# Finding Moto - Backend API

Backend REST API for Finding Moto application built with Node.js, Express, and MongoDB.

## Features

- Multi-role user authentication (buyer, seller, mechanic, admin)
- Role-based registration with approval workflow
- JWT-based authorization
- Google OAuth login
- MongoDB database integration
- RESTful API architecture
- Error handling middleware
- Request validation
- Security best practices

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/finding-moto
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user (buyer/seller/mechanic)
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/approval-status/:email` - Check approval status

### Authentication (Protected)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Admin Only
- `GET /api/auth/admin/pending` - Get pending approvals
- `PUT /api/auth/admin/approve/:userId` - Approve/reject user
- `GET /api/auth/admin/users` - Get all users
- `PUT /api/auth/admin/toggle-active/:userId` - Toggle user active status

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── models/         # Mongoose models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs

## License

ISC
