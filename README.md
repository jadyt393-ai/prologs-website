# PROLOGS

A white/blue digital-services storefront with a SQLite-backed admin dashboard.

This version is intended for lawful digital products and services such as:
- social-media management and marketing
- advertising/campaign support
- account setup using the customer's own information
- authorized software/VPN subscription support

It does not provide or facilitate the sale/distribution of unauthorized account credentials,
verification numbers, or stolen/accessed accounts.

## Run on a computer

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and change `JWT_SECRET` and `ADMIN_PASSWORD`.
5. Run `npm start`.
6. Open `http://localhost:3000`.
7. Admin: `http://localhost:3000/admin.html`.

## Admin

The first admin account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when the server starts.
Change the default password before deploying.
