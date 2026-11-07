# Admin account setup and access security

1. Register the trusted administrator account through the normal registration page.
2. In MongoDB Atlas, open the `campusconnect` database and `users` collection.
3. Find the account by its exact email address.
4. Change only its `role` field from `student` to `admin`.
5. Log out and log in again.

Public registration never accepts a role value; every new account is created as a student. The backend reloads the user's role from MongoDB on every protected request, and all `/api/admin` routes require both a valid JWT and the `admin` role. Students cannot promote themselves or call admin management endpoints.

Administrators can promote/demote other users, delete users (including their owned listings and related claims), update item statuses, delete listings, and approve/reject pending claims. An administrator cannot change their own role or delete their own account through these endpoints.

Keep the administrator credentials private. Use a long random `JWT_SECRET` and a restrictive `CORS_ORIGIN` in production.
