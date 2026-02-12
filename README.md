# Finding Moto

A full-stack MERN (MongoDB, Express, React, Node.js) application.

## Project Structure

```
Find_Moto/
│
├── frontend/               # React frontend application
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                # Node.js + Express backend API
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── app.js
│   ├── server.js
│   └── README.md
│
├── .gitignore
├── package.json
└── README.md
```

## Features

- User authentication (register/login)
- JWT-based authorization
- MongoDB database integration
- React Router for navigation
- Context API for state management
- RESTful API architecture
- Separate frontend and backend configurations

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd Find_Moto
```

### 2. Install all dependencies
```bash
npm run install-all
```

### 3. Configure environment variables

**Backend (.env in backend/ folder):**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/finding-moto
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env in frontend/ folder):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the application

**Development mode (both frontend and backend):**
```bash
npm run dev
```

**Run backend only:**
```bash
npm run server
```

**Run frontend only:**
```bash
npm run client
```

**Production:**
```bash
npm run build
npm start
```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

## Technologies Used

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS

## Development

Each folder (frontend and backend) has its own:
- `package.json` - Dependencies and scripts
- `.env` - Environment variables
- `.gitignore` - Ignore rules
- `README.md` - Specific documentation

Refer to the individual README files in each folder for more detailed information.

## License

ISC
