# LuxeMart Ecommerce App

A beginner-friendly Amazon-style ecommerce demo built with React + Vite + localStorage.

## Features

- Home page
- Product listing page
- Category filters
- Search
- Product detail page
- Cart
- Demo checkout
- Order success page
- Login and signup
- Customer, seller, and admin roles
- Seller/admin dashboard
- Product add/edit/delete
- Order history
- Fully browser-based storage using localStorage



## Option A - Run Locally

Install Node.js first.

Then open the project folder in VS Code or terminal and run:

```bash
npm install
npm run dev
```

Open the link shown in the terminal, usually:

```txt
http://localhost:5173
```

## Option B - Pull the Docker image
You do not need to install Node.js or npm manually. You only need Docker.

Run in terminal:
```txt
 docker pull ghcr.io/ehzem/secure-application-pipeline:latest
```


## Important Note

This project can run as a full-stack app with PostgreSQL and pgAdmin. If the backend/database setup is not running, the website may not be able to load or save database-backed data.

## Running the Full Application with Database

To run the full application with PostgreSQL, pgAdmin, backend API, and frontend, you need **three terminals** running at the same time.

### Terminal 1 - Start Database and pgAdmin

From the repository root folder:

```powershell
cd C:\Users\ehzem\Desktop\Secure-Application-Pipeline
docker compose up -d
```

This starts:

```txt
PostgreSQL database
pgAdmin browser database editor
```

Open pgAdmin in your browser:

```txt
http://localhost:5050
```

### Terminal 2 - Start Backend API

Open a second terminal and run:

```powershell
cd C:\Users\ehzem\Desktop\Secure-Application-Pipeline\server
npm install
npm run dev
```

The backend API should run on:

```txt
http://localhost:4000
```

To test if the backend is working, open:

```txt
http://localhost:4000/api/health
```

You should see a response like:

```json
{
  "ok": true,
  "message": "LuxeMart API is running"
}
```

### Terminal 3 - Start Frontend Website

Open a third terminal and run:

```powershell
cd C:\Users\ehzem\Desktop\Secure-Application-Pipeline\Application
npm install
npm run dev
```

Open the website in your browser using the link shown in the terminal, usually:

```txt
https://localhost:5173
```

## Testing Database Saving

To check if the website is saving data to the database:

1. Open the website:

```txt
https://localhost:5173
```

2. Login as admin or seller.

3. Add a new product from the dashboard.

4. Open pgAdmin:

```txt
http://localhost:5050
```

5. Go to:

```txt
Servers
  LuxeMart Database
    Databases
      luxemart_db
        Schemas
          public
            Tables
              products
```

6. Right click `products`.

7. Select:

```txt
View/Edit Data → All Rows
```

If the new product appears in the `products` table, then the website is saving to the PostgreSQL database correctly.

## Storage Note

The updated full-stack version uses:

```txt
PostgreSQL database → users, products, orders, order_items
localStorage → cart and current browser session
```

This means product, user, and order data should be stored in the database, while the cart and login session may still remain browser-based.
