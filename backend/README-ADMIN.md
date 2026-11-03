# Create an admin account (local development)

Public registration always creates a student account. To promote an account:
1. Register a normal account on the website.
2. Open MongoDB Atlas → Browse Collections → `campusconnect` database → `users` collection.
3. Find your user document and change `role` from `student` to `admin`.
4. Log out and log in again so a fresh token includes the updated account role.

Never expose admin credentials or enable public admin registration.
