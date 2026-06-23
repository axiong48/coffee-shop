# Coffee Shop Website

A local full-stack coffee shop web app built with React, Flask, and PostgreSQL.

Users can register, log in, browse coffee products, add products to a cart, checkout without real payment, view order history, and leave reviews.

Admins can add products, edit products, delete products, and view all orders.

---

## Tech Stack

- React
- Vite
- Flask
- PostgreSQL
- Flask-Login
- Flask-SQLAlchemy
- Flask-Migrate

---

## Project Structure

coffee-shop/
  backend/
    app/
    migrations/
    .env
    .env.example
    requirements.txt
    run.py
    seed.py

  frontend/
    src/
    package.json
    vite.config.js

  README.md
  .gitignore

---

## Requirements

Before running the project, make sure you have these installed:

- Node.js
- npm
- Python 3
- PostgreSQL
- Homebrew, if you are on Mac

Check your versions:

node -v
npm -v
python3 --version
psql --version

---

## PostgreSQL Setup Without Docker

Install PostgreSQL with Homebrew:

brew install postgresql@16

Start PostgreSQL:

brew services start postgresql@16

Check that PostgreSQL is working:

psql --version

Create the local database:

createdb coffee_shop

Check that the database exists:

psql -l

Press q to exit the database list screen.

---

## Backend Setup

Go into the backend folder:

cd backend

Create a Python virtual environment:

python3 -m venv venv

Activate the virtual environment:

source venv/bin/activate

You should see (venv) at the front of your terminal.

Install backend packages:

pip install -r requirements.txt

Create your local environment file:

cp .env.example .env

Your .env file should look like this:

DATABASE_URL=postgresql://localhost/coffee_shop
SECRET_KEY=dev-secret-key
FLASK_ENV=development

---

## Database Tables and Seed Data

Run the database migrations:

flask --app run.py db init
flask --app run.py db migrate -m "initial tables"
flask --app run.py db upgrade

Add starter data:

python seed.py

This creates starter coffee products and an admin account.

Admin login:

Email: admin@coffee.com
Password: admin123

---

## Run the Backend

Inside the backend folder, with (venv) activated, run:

python run.py

The backend should run at:

http://127.0.0.1:5000

Test these routes in the browser:

http://127.0.0.1:5000/api/health
http://127.0.0.1:5000/api/products

The root backend URL may show Not Found. That is normal because the Flask backend is only for API routes.

---

## Frontend Setup

Open a new terminal tab.

Go into the frontend folder:

cd frontend

Install frontend packages:

npm install

Run the React frontend:

npm run dev

The frontend should run at:

http://localhost:5173

---

## Local Development URLs

Frontend:

http://localhost:5173

Backend:

http://127.0.0.1:5000

The React frontend is the actual website.

The Flask backend is the API that sends and receives data.

---

## Sharing on Local Wi-Fi

To let another laptop on the same Wi-Fi view the project, you need your local IP address.

On Mac, run:

ipconfig getifaddr en0

Example result:

192.168.1.25

The other laptop can open:

http://192.168.1.25:5173

For backend sharing, Flask needs to run on all network interfaces.

In backend/run.py, use:

app.run(host="0.0.0.0", port=5000, debug=True)

Then other laptops can reach the backend at:

http://192.168.1.25:5000

Replace 192.168.1.25 with your real local IP address.

---

## Common Commands

Activate backend virtual environment:

cd backend
source venv/bin/activate

Run backend:

python run.py

Run frontend:

cd frontend
npm run dev

Stop a running server:

Control + C

Start PostgreSQL:

brew services start postgresql@16

Stop PostgreSQL:

brew services stop postgresql@16

---

## Common Problems

### Flask says Not Found

If you open this:

http://localhost:5000/

You may see Not Found.

That is normal. The backend only has API routes.

Use:

http://127.0.0.1:5000/api/health
http://127.0.0.1:5000/api/products

---

### Access to localhost was denied / 403

Try using:

http://127.0.0.1:5000/api/health

instead of:

http://localhost:5000

Also make sure you are not opening an admin route before logging in.

---

### psycopg2 or pg_config error

Install PostgreSQL first:

brew install postgresql@16
brew services start postgresql@16

Then delete and recreate the virtual environment:

rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

---

### Database does not exist

Create it:

createdb coffee_shop

---

### Virtual Environment Reminder

Backend uses a virtual environment:

source venv/bin/activate

Frontend does not use a virtual environment.

Simple rule:

Backend Flask = use venv
Frontend React = no venv
PostgreSQL = no venv
