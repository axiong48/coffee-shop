#Coffee Shop Ordering App

A full-stack web app for online coffee ordering with three roles: Customer, Barista, and Owner.

## Stack
- **Backend:** Flask, SQLAlchemy (SQLite), Flask-Login (session auth), Werkzeug password hashing
- **Frontend:** React (Vite), React Router

## Features implemented
- Signup/login with hashed & salted passwords, session-based auth
- **Customer:** browse menu by location, customize items (size/milk/etc.), multi-item cart, checkout,
  order history, rewards points (earn on purchase, redeem at checkout)
- **Barista:** order queue scoped to their assigned location, advance order status
  (pending → in progress → ready → picked up), polls every 5s for new orders
- **Owner:** full menu CRUD (price, availability, customizations), location management,
  analytics dashboard (revenue by location, top-selling items), can also see the barista queue
- `price_at_purchase` is frozen server-side at checkout so later price changes never
  retroactively affect past orders
- Prices are always recalculated server-side at checkout — the client never dictates price

## Local setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py        # creates DB + demo accounts + sample menu
python app.py          # runs on http://127.0.0.1:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev             # runs on http://127.0.0.1:5173
```

Open http://127.0.0.1:5173. Demo accounts (from seed.py):
| Role | Email | Password |
|---|---|---|
| Owner | owner@coffee.com | owner123 |
| Barista (Downtown) | barista@coffee.com | barista123 |
| Customer | customer@coffee.com | customer123 |

## Deploying live (required by the assignment)

You need both pieces hosted publicly. Fastest path given your deadline:

**Backend — Render.com (free tier, no credit card needed for basic web service):**
1. Push this repo to GitHub.
2. On Render: New → Web Service → connect repo, root directory `backend`.
3. Build command: `pip install -r requirements.txt && python seed.py`
4. Start command: `gunicorn app:create_app()` — add `gunicorn` to requirements.txt first
   (`pip install gunicorn` and append to requirements.txt), since Flask's dev server
   shouldn't be used in production.
5. Set env var `SECRET_KEY` to a random string.
6. **Important:** SQLite on Render's free tier is not persistent across deploys/restarts —
   fine for a demo, but if you want data to survive, swap to Render's free Postgres
   and change `SQLALCHEMY_DATABASE_URI` accordingly.
7. In `app.py`, set `SESSION_COOKIE_SECURE = True` once you're on HTTPS (Render gives you
   HTTPS by default) — cross-site cookies require `Secure` + `SameSite=None` together.

**Frontend — Vercel or Netlify (free, fastest):**
1. In `frontend/src/api.js`, change `BASE_URL` to your deployed backend URL.
2. In `backend/app.py`, update the `cors.init_app(...)` origins list to your deployed frontend URL.
3. Connect the repo on Vercel/Netlify, root directory `frontend`, build command `npm run build`,
   output directory `dist`.

Do this early — CORS/cookie issues between two different domains are the most common
last-minute deploy headache, so test the live URLs together well before your 10am demo,
not right before.

## Project structure
```
backend/
  app.py              # app factory, blueprint registration
  models.py            # 7 SQLAlchemy models (User, Location, MenuItem,
                        #   CustomizationOption, Order, OrderItem, OrderItemCustomization)
  decorators.py         # role_required() access control
  seed.py               # demo data
  routes/
    auth.py             # signup/login/logout/me
    menu.py              # public menu/location browsing
    orders.py            # checkout, order history, barista/owner queue, status updates
    owner.py             # menu/location CRUD, analytics

frontend/
  src/
    api.js               # fetch wrapper (credentials included for session cookies)
    context/
      AuthContext.jsx     # current user + role
      CartContext.jsx      # in-progress cart state
    components/
      Navbar.jsx, ProtectedRoute.jsx, CustomizeModal.jsx
    pages/
      Home, Login, Signup
      MenuPage, CartPage, OrderHistoryPage          (customer)
      BaristaQueuePage                                (barista)
      OwnerMenuPage, OwnerLocationsPage, OwnerAnalyticsPage  (owner)
```

## Not yet implemented (optional stretch ideas if you have time)
- Live WebSocket push for order status (currently uses polling every 5-6s, which works
  fine for a demo but isn't true real-time)
- Staff invite flow for creating barista accounts through the UI (currently done via
  signup with role override, or directly in seed.py)
