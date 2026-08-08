# PROLOGS

A white/blue digital-services marketplace with a real SQLite-backed admin dashboard.

## Run on a computer
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and change JWT_SECRET and ADMIN_PASSWORD.
5. Run `npm start`.
6. Open `http://localhost:3000`.
7. Admin: `http://localhost:3000/admin.html`.

## Important
The starter catalog is for authorized digital services. Do not use it to sell or distribute unauthorized account credentials or verification numbers.

## Admin
The first admin account is created from ADMIN_EMAIL and ADMIN_PASSWORD when the server starts. Change the default password before deploying.
