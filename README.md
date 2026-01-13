# GigFlow - Mini Freelance Marketplace

A full-stack freelance marketplace platform where Clients can post jobs (Gigs) and Freelancers can apply for them (Bids).

## Features

- ✅ User Authentication (Sign-up/Login with JWT and HttpOnly cookies)
- ✅ Gig Management (Browse, Search, Post jobs)
- ✅ Bidding System (Freelancers can bid on gigs)
- ✅ Hiring Logic with Transactional Integrity (MongoDB transactions to prevent race conditions)
- ✅ Real-time Notifications (Socket.io integration for instant updates)

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router
- Axios
- Socket.io Client

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.io
- bcryptjs

## Project Structure

```
.
├── backend/
│   ├── models/          # MongoDB models (User, Gig, Bid)
│   ├── routes/          # API routes (auth, gigs, bids)
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context (Auth, Socket)
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and set HttpOnly cookie
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs?search=query` - Get all open gigs (with optional search)
- `POST /api/gigs` - Create a new gig (authenticated)
- `GET /api/gigs/:id` - Get a single gig

### Bids
- `POST /api/bids` - Submit a bid for a gig (authenticated)
- `GET /api/bids/:gigId` - Get all bids for a gig (owner only)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (atomic transaction)
- `GET /api/bids/user/my-bids` - Get all bids by current user

## Database Schema

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)

### Gig
- `title` (String, required)
- `description` (String, required)
- `budget` (Number, required)
- `ownerId` (ObjectId, ref: User)
- `status` (String, enum: ['open', 'assigned'])

### Bid
- `gigId` (ObjectId, ref: Gig)
- `freelancerId` (ObjectId, ref: User)
- `message` (String, required)
- `price` (Number, required)
- `status` (String, enum: ['pending', 'hired', 'rejected'])

## Key Features Implementation

### Hiring Logic with Transactional Integrity
The hiring process uses MongoDB transactions to ensure atomicity:
- When a client hires a freelancer, the system:
  1. Updates the gig status to 'assigned'
  2. Marks the selected bid as 'hired'
  3. Marks all other bids for that gig as 'rejected'
- All operations happen atomically, preventing race conditions

### Real-time Notifications
- Uses Socket.io for real-time communication
- When a freelancer is hired, they receive an instant notification
- Notifications appear in the navbar and on the "My Bids" page

## Bonus Features Implemented

✅ **Bonus 1: Transactional Integrity** - MongoDB transactions prevent race conditions when multiple users try to hire simultaneously

✅ **Bonus 2: Real-time Updates** - Socket.io integration provides instant notifications when a freelancer is hired

## Development

### Backend
- Uses nodemon for auto-reload during development
- ES6 modules (type: "module")

### Frontend
- Vite for fast development and building
- Tailwind CSS for styling
- React Context API for state management

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

## License

ISC
