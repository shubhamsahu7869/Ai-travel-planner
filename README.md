# AI Travel Planner

A full-stack travel planning web application for creating AI-assisted trip plans with authentication, user-specific dashboards, editable itineraries, budget estimates, and stay suggestions.

## Live Links

- Frontend: https://ai-travel-planner-pxrr.vercel.app
- Backend: https://ai-travel-planner-backend-3m98.onrender.com
- Repository: https://github.com/shubhamsahu7869/Ai-travel-planner

## Features

- User registration and login
- JWT-based authentication
- Protected dashboard and trip pages
- Strict user data isolation for trip records
- Trip creation using destination, number of days, budget type, and interests
- AI-generated day-by-day itinerary
- Destination-aware budget estimate
- Hotel or stay suggestions
- Add, edit, and delete itinerary activities
- Regenerate a specific itinerary day
- Trip Mood Optimizer custom feature

## Tech Stack

- Frontend: Next.js, React, JavaScript, Tailwind CSS
- Backend: Node.js, Express, JavaScript
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT and bcrypt
- Validation: Zod
- AI provider: OpenRouter using an OpenAI-compatible SDK
- Deployment: Vercel for frontend, Render for backend

## Folder Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    app.js
    server.js

frontend/
  app/
  components/
  hooks/
  lib/
```

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=ai_travel_planner
JWT_SECRET=your_jwt_secret
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-20b:free
CLIENT_URL=http://localhost:3000
PORT=4000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`
- `POST /api/trips/:id/regenerate-day`
- `POST /api/trips/:id/optimize-mood`
- `POST /api/trips/:id/add-activity`
- `POST /api/trips/:id/update-activity`
- `POST /api/trips/:id/delete-activity`

## Architecture

The frontend is a Next.js app that communicates with the Express backend through `NEXT_PUBLIC_API_URL`. The backend owns authentication, trip authorization, AI calls, and MongoDB persistence. MongoDB stores users and trips separately, with every trip linked to the authenticated user's ID.

The backend is organized into routes, controllers, middleware, models, config, and services. This keeps request handling, authorization, database schemas, and AI generation separate.

## Authentication And Authorization

Passwords are hashed with bcrypt before storage. On register or login, the backend signs a JWT containing the user's ID. Protected API routes require an `Authorization: Bearer <token>` header.

Trip authorization is enforced server-side. Trip queries use both the trip ID and `req.userId`, so users cannot read, update, or delete another user's trip even if they know the trip ID.

## AI Agent Design

The AI service asks the model for structured JSON so the frontend can render itinerary days, budget estimates, hotel suggestions, regenerated days, and mood-optimized plans consistently.

For trip creation, the backend generates:

- Itinerary
- Budget estimate
- Hotel suggestions

These are generated in parallel to reduce waiting time. The service uses OpenRouter with an OpenAI-compatible client. If the live AI provider fails, the backend has limited fallback behavior for development.

## Custom Feature: Trip Mood Optimizer

The Trip Mood Optimizer lets users adjust an existing itinerary by selecting a travel mood:

- Relaxed
- Packed
- Romantic
- Family Friendly
- Adventure Heavy
- Cultural

I built this because travelers often know the feeling they want from a trip, not only the destination or budget. This feature solves the problem of generic plans by allowing users to personalize the pace and experience of an existing itinerary without creating a new trip from scratch.

## Key Design Decisions And Trade-Offs

- JWT auth keeps the backend stateless and simple to deploy.
- Trips are always scoped by authenticated user ID for data isolation.
- The AI response is requested as JSON to reduce frontend parsing complexity.
- OpenRouter was used to support free-tier AI usage during development.
- Local fallback data is intentionally limited; exact worldwide place generation depends on the live AI provider.
- JWT is stored in localStorage for simplicity in this demo project. A production app could use secure HTTP-only cookies.

## Known Limitations

- Free AI models can be slower and may occasionally return imperfect JSON.
- Hotel suggestions are AI-generated and should be verified before real booking.
- Budget estimates are approximate and may vary by season, transport mode, and traveler choices.
- Render free instances may sleep after inactivity, causing the first request to be slow.

## Deployment

Frontend is deployed on Vercel.

Required frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://ai-travel-planner-backend-3m98.onrender.com
```

Backend is deployed on Render.

Required backend environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-20b:free
CLIENT_URL=https://ai-travel-planner-pxrr.vercel.app
```

MongoDB Atlas must allow Render network access. For a simple demo deployment, `0.0.0.0/0` can be used in Atlas Network Access.
