# CampusConnect – Smart Lost & Found Management System

A beginner-friendly MERN project for campus lost-and-found reporting.

## Requirements
- Node.js (LTS)
- MongoDB Atlas account (or local MongoDB)
- VS Code

## 1. Backend setup
Open a terminal:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your MongoDB connection string and a private JWT secret.

```bash
npm run dev
```

Backend: http://localhost:5001

## 2. Frontend setup
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the exact Vite URL shown in the terminal (normally http://localhost:5173).

## 3. Create an account
Register through the website, then log in. New accounts are students.
For admin access, see `backend/README-ADMIN.md`.

## Features included
- Student registration and login (JWT)
- Report lost/found items
- Browse and filter items stored in MongoDB
- Submit claims with a proof description
- View your own reports and claims
- Admin claim review API and basic admin page access
- Responsive layout

## Important
- Keep the backend and frontend terminals running.
- Do not upload `.env` or share your MongoDB password.
- The project requires a working MongoDB connection.
- Image upload and automated AI matching are not implemented; item images are represented by optional image URLs.
