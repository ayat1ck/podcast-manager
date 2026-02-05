# 🎙️ Podcast Manager API

A RESTful API backend for managing personal podcast collections. Users can register, login, and manage their saved podcasts with full CRUD operations. Includes iTunes Podcast API integration for discovering new podcasts.

## 📋 Project Overview

**Podcast Manager** is a Node.js/Express.js backend application that allows users to:
- Create an account and securely authenticate
- Save, update, and organize their favorite podcasts
- Rate podcasts and track listening status (listening, completed, wishlist)
- Discover new podcasts via iTunes Search API integration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **External API**: iTunes Search API

## 📁 Project Structure

```
podcast-manager-api/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Auth logic (register, login)
│   ├── userController.js     # User profile logic
│   └── podcastController.js  # Podcast CRUD logic
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── errorMiddleware.js    # Global error handler
│   └── validateMiddleware.js # Joi validation
├── models/
│   ├── User.js               # User schema
│   └── Podcast.js            # Podcast schema
├── routes/
│   ├── authRoutes.js         # /api/auth/*
│   ├── userRoutes.js         # /api/users/*
│   └── podcastRoutes.js      # /api/podcasts/*
├── utils/
│   └── itunesApi.js          # iTunes API helper
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── server.js                 # Entry point
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## 🚀 Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd podcast-manager-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/podcast-manager
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

6. **Server will start at**
   ```
   http://localhost:5000
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints (Public)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | `{ username, email, password }` |
| POST | `/api/auth/login` | Login and get token | `{ email, password }` |

### User Endpoints (Private - Requires Token)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get logged-in user profile | - |
| PUT | `/api/users/profile` | Update user profile | `{ username?, email? }` |

### Podcast Endpoints (Private - Requires Token)

| Method | Endpoint | Description | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/api/podcasts` | Create a new podcast | `{ title, author, description?, imageUrl?, rating?, status? }` |
| GET | `/api/podcasts` | Get all user podcasts | - |
| GET | `/api/podcasts/:id` | Get a specific podcast | - |
| PUT | `/api/podcasts/:id` | Update a podcast | `{ title?, author?, description?, imageUrl?, rating?, status? }` |
| DELETE | `/api/podcasts/:id` | Delete a podcast | - |
| GET | `/api/podcasts/search/itunes` | Search iTunes podcasts | Query: `?term=searchTerm&limit=10` |

### Request Headers

For protected routes, include the JWT token:
```
Authorization: Bearer <your_jwt_token>
```

## 📝 Data Models

### User Model
```javascript
{
  username: String (required, unique, min: 3),
  email: String (required, unique, valid email),
  password: String (required, min: 6, hashed),
  createdAt: Date (auto-generated)
}
```

### Podcast Model
```javascript
{
  title: String (required),
  author: String (required),
  description: String (optional),
  imageUrl: String (optional),
  rating: Number (1-5, optional),
  status: Enum ['listening', 'completed', 'wishlist'] (default: 'wishlist'),
  userId: ObjectId (reference to User),
  createdAt: Date (auto-generated)
}
```

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication:

1. Register a new account or login to receive a token
2. Include the token in the `Authorization` header for protected routes
3. Tokens expire after 30 days

## ❌ Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not authorized to access resource |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal server error |

Error Response Format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## 📖 API Usage Examples

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your_token>"
```

### Create a Podcast (Protected)
```bash
curl -X POST http://localhost:5000/api/podcasts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"title":"The Daily","author":"NY Times","description":"Daily news podcast","status":"listening"}'
```

### Search iTunes Podcasts (Protected)
```bash
curl -X GET "http://localhost:5000/api/podcasts/search/itunes?term=technology&limit=5" \
  -H "Authorization: Bearer <your_token>"
```

## 🌐 Deployment

### Environment Variables for Production

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/podcast-manager
JWT_SECRET=your_very_long_and_secure_secret_key
NODE_ENV=production
```

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

## 👤 Author

Assignment 4 - Web Development Final Project

## 📄 License

ISC
