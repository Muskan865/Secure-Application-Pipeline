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

## Demo Accounts

Admin:

```txt
admin@luxemart.com
admin123
```

Seller:

```txt
seller@luxemart.com
seller123
```

Customer:

```txt
customer@luxemart.com
customer123
```

## Run Locally

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

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy Free on Vercel

1. Push this folder to GitHub.
2. Go to Vercel.
3. Click Add New Project.
4. Import the GitHub repository.
5. Vercel should detect Vite automatically.
6. Use these settings if asked:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

7. Click Deploy.

## Deploy Free on Netlify

1. Push this folder to GitHub.
2. Go to Netlify.
3. Click Add new site.
4. Import from GitHub.
5. Use these settings:

```txt
Build Command: npm run build
Publish Directory: dist
```

6. Click Deploy.

## Important Note

This is a front-end demo app. It uses localStorage, so data is saved only inside the browser. For a real ecommerce app, you should later add:

- Real database
- Real authentication
- Secure admin permissions
- Real payment gateway
- Backend API
- Image uploads
- Order status management
