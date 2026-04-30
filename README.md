# AI Travel Planner

A production-ready full-stack travel planning web application designed for the Trao Full-Stack Engineering Assessment.

## Overview

This project helps users register, log in, create trips, generate AI-powered itineraries, estimate budgets, and optimize trip moods while enforcing strong user data isolation.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- Validation: Zod
- AI: OpenAI API (or compatible LLM integration)

## Folder Structure

- `backend/`
  - `src/config/`
  - `src/controllers/`
  - `src/middleware/`
  - `src/models/`
  - `src/routes/`
  - `src/services/`
  - `src/app.ts`
  - `src/server.ts`
- `frontend/`
  - `app/`
  - `components/`
  - `lib/`
  - `types/`

## Local Setup

1. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```
2. Install dependencies for frontend:
   ```bash
   cd ../frontend
   npm install
   ```
3. Create environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Set the following values:
     - `MONGODB_URI` for your Atlas or local MongoDB connection string
     - `JWT_SECRET` for JWT signing
     - `OPENAI_API_KEY` if you want real AI generation; if omitted, the app uses realistic local mock data
     - `PORT` for the backend port (default 4000)
4. Run backend in development:
   ```bash
   cd backend
   npm run dev
   ```
5. Run frontend in development:
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

## Auth and Authorization

- Passwords are hashed with `bcrypt`.
- JWTs are signed with `JWT_SECRET` and validated on protected routes.
- Trips are always queried by both `tripId` and `userId` to enforce ownership.

## AI Agent Design

The AI service generates structured itinerary JSON and creates budget and hotel suggestions based on trip inputs. The backend service also supports day regeneration and mood optimization while preserving user data ownership.

## Trip Mood Optimizer

This feature allows travelers to choose a mood and have the itinerary tuned accordingly. It solves the problem that many travelers know how they want to feel, but not the exact activities, by aligning itinerary structure to Relaxed, Packed, Romantic, Family Friendly, Adventure Heavy, or Cultural moods.

## Deployment

- Frontend: deploy on Vercel
- Backend: deploy on Render, Railway, or similar
- Database: MongoDB Atlas
- Secrets: store `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`
