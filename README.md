# CampusConnect – Smart Lost & Found Management System

**Developed by: T. Mahesh Reddy**

CampusConnect is a campus lost-and-found web application. Students can report lost or found items, submit ownership claims, and confirm item handovers. Administrators review claims and monitor successful deliveries.

## Technology
- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Authentication: JSON Web Tokens (JWT)
- Deployment: Vercel (frontend) and Render (backend)

## Features
- Student registration and login
- Report an item using **I Found This** or **I Lost This**
- Private contact details for the reporter and claimant
- Search and filter campus reports
- Submit an ownership claim with proof
- Separate student pages for My Reports and My Claims
- Separate Student and Admin dashboards
- Admin dashboard with statistics and management controls for users, items and claims
- Admin approval and rejection
- Admin can update user roles, delete users, change item status and delete item records
- Two-way return confirmation: founder selects **I Returned This Item** and claimant selects **I Received My Item**
- Claim becomes **Successful** and item becomes **Returned** only after both confirmations; the backend stores each confirmation timestamp and the final return date/time

## Run locally

### Backend
1. Open a terminal in `backend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Add your own MongoDB Atlas URI and a long random JWT secret to `.env`.
5. Run `npm run dev`.

The API uses port 5001 by default.

### Frontend
1. Open another terminal in `frontend`.
2. Run `npm install`.
3. Create `frontend/.env` with:
   `VITE_API_URL=http://localhost:5001/api`
4. Run `npm run dev`.

## Deployment

### Render backend
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, and `CORS_ORIGIN`
- Set `CORS_ORIGIN` to your Vercel frontend URL.

### Vercel frontend
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

After changing environment variables, redeploy the relevant service.

## Admin account setup
Public registration always creates a `student` account. To designate the trusted administrator, create a normal account first, then change that account's `role` field to `admin` in the `campusconnect.users` collection in MongoDB Atlas. Never expose admin-role editing in the public registration form.

## Important notes
- Existing Atlas records are not deleted or reset by this update.
- Older item records may not contain reporter contact details. New reports collect these details.
- Phone numbers and email addresses are excluded from student browse, report-tracking and founder claim-list APIs. Administrators can review contact information from the protected admin claim interface.
- Before production use, configure a restrictive `CORS_ORIGIN`, rotate any credentials that may have been shared, and test with separate student and admin accounts.
