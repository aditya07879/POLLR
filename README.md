# Pollr — Real-time Online Polling App

A full-stack MERN polling application with Socket.IO real-time voting updates.

## Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT, bcryptjs
- **Frontend**: React 18, React Router v6, Axios, Socket.IO Client

---

## Project Structure

```
polling-app/
├── server/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login
│   │   └── pollController.js   # CRUD + Vote
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   └── Poll.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── polls.js
│   ├── sockets/
│   │   └── pollSocket.js       # Socket.IO event handlers
│   ├── .env.example
│   ├── index.js                # Entry point
│   └── package.json
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── CreatePoll.js
│   │   │   └── PollPage.js     # Vote + live results
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── utils/
│   │   │   ├── api.js          # Axios instance
│   │   │   └── useCountdown.js # Countdown timer hook
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   └── package.json
│
├── package.json                # Root (concurrently)
└── README.md
```

---

## Prerequisites

- Node.js v18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string

---

## Setup

### 1. Clone / extract the project

```bash
cd polling-app
```

### 2. Install all dependencies

```bash
npm run install:all
```

Or manually:

```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/polling-app
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:3000
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/polling-app
```

### 4. Run in development

```bash
# From root (runs both server + client concurrently)
npm run dev
```

Or separately:

```bash
# Terminal 1 — backend on :5000
npm run dev:server

# Terminal 2 — frontend on :3000
npm run dev:client
```

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login, get JWT |
| POST | `/api/polls` | ✅ | Create poll |
| GET | `/api/polls/user` | ✅ | Get own polls |
| GET | `/api/polls/:id` | — | Get poll by slug or ID |
| POST | `/api/polls/:id/vote` | — | Vote on a poll |
| DELETE | `/api/polls/:id` | ✅ | Delete own poll |

---

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `joinPoll` | Client → Server | `pollSlug: string` |
| `leavePoll` | Client → Server | `pollSlug: string` |
| `voteUpdate` | Server → Room | Updated poll object |

---

## Features

- **JWT Authentication** — register, login, protected poll creation
- **Poll Creation** — question, 2–6 options, custom expiry datetime
- **Public Voting** — no login required; shareable link via UUID slug
- **Duplicate Vote Prevention** — via `x-voter-token` header (localStorage UUID)
- **Expiry Enforcement** — server rejects votes on expired polls; frontend shows countdown timer
- **Real-time Results** — Socket.IO rooms per poll; live bar chart updates on every vote without refresh
- **Dashboard** — view, manage, and delete your polls; see active/expired status and vote counts

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Expired polls block votes server-side (not just client-side)
- Voter tokens stored in localStorage prevent repeat votes from the same browser
- For production, add rate limiting (e.g. `express-rate-limit`) and HTTPS
