# HNG Stage 1 - Data Persistence & API Design

A REST API that accepts a name, enriches it using external APIs,
stores the result in MongoDB, and exposes endpoints to manage profiles.

## Live URL
profile-intelligence-api-production-3783.up.railway.app

## Tech Stack
- Node.js / Express
- MongoDB / Mongoose
- Axios

## API Endpoints

### Create Profile
POST /api/profiles  
Body:
```json
{ "name": "ella" }