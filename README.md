# VidFlow 🎬

A full-stack YouTube-style video streaming platform built with React, Node.js, Express, MongoDB, and the YouTube Data API v3.

## Features

- Real YouTube video search via YouTube Data API v3
- Video playback using official YouTube embedded player
- User authentication (JWT + bcrypt)
- Watch history, Watch Later, Liked Videos
- Custom playlists (create, manage, add/remove videos)
- Channel subscriptions with feed
- App-level comment system with replies and likes
- Shorts-style vertical video feed
- Dark/Light/System theme
- Fully responsive (desktop, tablet, mobile)
- Search suggestions with debouncing
- Notification system
- Skeleton loading states

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router v6, Lucide React
- Backend: Node.js, Express.js
- Database: MongoDB Atlas (Mongoose)
- Auth: JWT + bcryptjs
- Video API: YouTube Data API v3

## Project Structure

```
vidflow/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       └── context/
├── server/          # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── config/
├── .env.example
└── README.md
```

## Setup

### 1. Clone & Install

```bash
# Install root deps
npm install

# Install all deps (client + server)
npm run install:all
```

### 2. Configure Environment Variables

Copy `.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

Fill in these values in `server/.env`:

```env
YOUTUBE_API_KEY=YOUR_YOUTUBE_DATA_API_V3_KEY
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vidflow
JWT_SECRET=your_secret_minimum_32_chars
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Get YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. Paste the key in `server/.env` as `YOUTUBE_API_KEY`

### 4. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or `0.0.0.0/0` for dev)
5. Copy the connection string into `MONGODB_URI`

## Running the App

### Development (both servers)

```bash
npm run dev
```

Or separately:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

```bash
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/videos/search?q= | Search videos |
| GET | /api/videos/trending | Trending videos |
| GET | /api/videos/shorts | Shorts feed |
| GET | /api/videos/:id | Video details |
| GET | /api/videos/:id/related | Related videos |
| GET | /api/channels/:id | Channel info |
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST/GET | /api/history | Watch history |
| POST/GET | /api/watch-later | Watch Later |
| POST/GET | /api/playlists | Playlists |
| POST/GET | /api/comments/:videoId | Comments |
| POST/DELETE | /api/subscriptions | Subscriptions |
| POST/GET | /api/likes | Liked videos |
| GET | /api/notifications | Notifications |

## Troubleshooting

**YouTube API quota exceeded:**  
The free quota is 10,000 units/day. Reduce search frequency or request a quota increase in Google Cloud Console.

**MongoDB connection failed:**  
Check your MONGODB_URI and ensure your IP is whitelisted in Atlas Network Access.

**Videos not loading:**  
Verify YOUTUBE_API_KEY is set correctly in `server/.env` (not client).

**CORS errors:**  
Ensure CLIENT_URL in `server/.env` matches your frontend URL exactly.
