# AI Coding Mentor

AI Coding Mentor is a full-stack application for generating, executing, and evaluating code using AI services. The project is split into a backend API and a frontend client.

## Architecture

- `backend/` - Node.js and Express server
  - `controllers/` - HTTP request handlers
  - `middlewares/` - authentication and request middleware
  - `models/` - MongoDB data models
  - `routes/` - API endpoint definitions
  - `services/` - integration with external services and business logic
- `frontend/` - Vite-based client application
  - `src/` - application source files
  - `public/` - static assets
  - `src/components/` - reusable UI components
  - `src/pages/` - page-level interfaces
  - `src/utils/api.js` - frontend API integration

## Key Features

- AI-powered code generation and execution workflow
- User authentication and session handling
- Code submission management with persistence
- Plagiarism and evaluation service integration

## Prerequisites

- Node.js 18+ installed
- npm or yarn available
- MongoDB instance or Atlas cluster

## Setup

1. Clone the repository.
2. Install dependencies for both backend and frontend.

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Backend Configuration

Create a `.env` file inside `backend/` with the required environment variables:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
OPENAI_API_KEY=<your-openai-api-key>
```

Adjust values according to your environment and provider configuration.

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

or for production:

```bash
npm start
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on Vite and will typically be available at `http://localhost:5173`.

## Project Structure

- `backend/server.js` - entry point for backend services
- `backend/routes/` - API route definitions
- `backend/controllers/` - controller functions for requests
- `backend/services/` - AI, code execution, and plagiarism logic
- `frontend/src/main.js` - frontend entry point
- `frontend/src/pages/` - page views for authentication and dashboard

## Notes

- The current implementation excludes interview-related features.
- Ensure the backend is running before using the frontend client.
- Review the backend service configuration if you switch AI providers or execution engines.

## License

This project does not include a license file. Add one if you plan to share or publish the code.
