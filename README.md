# 🍔 FoodHub — Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**A modern, full-featured food delivery web application built with Next.js 16, React 19, Tailwind CSS v4, and Radix UI.**

[Live App](https://bdfoodhub.vercel.app) · [Backend Repo](../FoodHub-Backend/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Deployment](#-deployment)

---

## 🌟 Overview

FoodHub is a full-stack food delivery platform that connects **Customers** with **Meal Providers**. The frontend is built with the App Router in **Next.js 16** and leverages **React 19**, **Tailwind CSS v4**, **Radix UI** primitives, and **Better Auth** for authentication. It communicates with the FoodHub REST API backend through Next.js API route rewrites.

---

## ✨ Features

- 🔐 **Authentication** — Sign up, sign in, sign out, and Google OAuth via Better Auth, with role selection on first login
- 👤 **Role-Based UI** — Conditional views for `CUSTOMER`, `PROVIDER`, and `ADMIN` roles
- 🍽️ **Meal Browsing** — Explore meals by category, search, filter, and view details
- 🛒 **Order Management** — Place orders, track statuses, and view order history
- ⭐ **Reviews** — Leave star ratings and comments on delivered orders
- 🖼️ **Image Uploads** — Provider meal images and review photos via ImgBB API
- 🌙 **Dark / Light Mode** — Theme switching with `next-themes`
- 📱 **Responsive Design** — Mobile-first layouts across all pages
- 🤖 **AI Features** — OpenRouter API integration for intelligent meal recommendations
- 🛡️ **Admin Dashboard** — Manage users, meals, categories, orders, and reviews
- 🏪 **Provider Dashboard** — Manage own meals and incoming orders
- 🧾 **Customer Dashboard** — View your orders and profile

---

## 🛠 Tech Stack

| Layer              | Technology                                  |
|--------------------|---------------------------------------------|
| Framework          | Next.js 16 (App Router)                     |
| UI Library         | React 19                                    |
| Language           | TypeScript 5                                |
| Styling            | Tailwind CSS v4 + tw-animate-css            |
| Component Library  | Radix UI (Primitives)                       |
| Icons              | Lucide React                                |
| Forms              | TanStack Form v1                            |
| Carousel           | Embla Carousel                              |
| Notifications      | Sonner (toast)                              |
| Authentication     | Better Auth 1.4 (Google OAuth)              |
| Image Upload       | ImgBB API                                   |
| AI                 | OpenRouter API                              |
| Env Validation     | @t3-oss/env-nextjs                          |
| Deployment         | Vercel                                      |

---

## 📁 Project Structure

```
foodhub-frontend/
├── app/
│   ├── (authenticationLayout)/     # Auth pages (sign-in, sign-up, role selection)
│   ├── (commonLayout)/             # Public & user pages with shared navbar/footer
│   │   ├── (homepage)/             # Landing page
│   │   ├── about/                  # About page
│   │   ├── blog/                   # Blog page
│   │   ├── categories/             # Browse meal categories
│   │   ├── contact/                # Contact page
│   │   ├── dashboard/              # User dashboard (customer / provider)
│   │   ├── explore/                # Explore all meals
│   │   ├── help/                   # Help & FAQ
│   │   ├── meals/                  # Meal detail pages
│   │   ├── privacy/                # Privacy policy
│   │   ├── topbrands/              # Top meal providers
│   │   └── your-orders/            # Customer order history
│   ├── (profile)/
│   │   └── profile/                # User profile settings
│   ├── admin/                      # Admin dashboard
│   │   ├── @dashboard/             # Admin overview (parallel route)
│   │   ├── categories/             # Admin category management
│   │   ├── customers/              # Admin customer management
│   │   ├── meals/                  # Admin meal management
│   │   ├── orders/                 # Admin order management
│   │   ├── providers/              # Admin provider management
│   │   └── reviews/                # Admin review management
│   ├── api/                        # Next.js API routes
│   ├── globals.css                 # Global styles & Tailwind config
│   ├── layout.tsx                  # Root layout (fonts, providers)
│   └── not-found.tsx               # 404 page
├── components/                     # Shared UI components
├── hooks/                          # Custom React hooks
├── lib/                            # Library configurations (auth client, utils)
├── providers/                      # React context providers (theme, auth, etc.)
├── services/                       # API service functions
│   ├── meal.service.ts             # Meal API calls (server-side)
│   ├── meal.client.service.ts      # Meal API calls (client-side)
│   ├── order.service.ts            # Order API calls
│   ├── order.client.service.ts     # Order client API calls
│   ├── provider.service.ts         # Provider API calls
│   ├── user.service.ts             # User API calls
│   └── user.client.service.ts      # User client API calls
├── types/                          # Shared TypeScript types & interfaces
├── public/                         # Static assets
├── proxy.ts                        # Proxy helper
├── next.config.ts                  # Next.js config (rewrites, image domains)
├── components.json                 # Radix UI / shadcn component config
├── postcss.config.mjs              # PostCSS config (Tailwind)
├── tsconfig.json
└── package.json
```

---

## 🗺️ Pages & Routes

| Route                    | Description                                  | Access         |
|--------------------------|----------------------------------------------|----------------|
| `/`                      | Homepage — hero, featured meals, categories  | Public         |
| `/explore`               | Browse & search all meals                    | Public         |
| `/meals/[id]`            | Meal detail with order button                | Public         |
| `/categories`            | Browse meals by category                     | Public         |
| `/topbrands`             | Featured meal providers                       | Public         |
| `/about`                 | About FoodHub                                | Public         |
| `/blog`                  | Blog / news                                  | Public         |
| `/contact`               | Contact form                                 | Public         |
| `/help`                  | Help & FAQ                                   | Public         |
| `/privacy`               | Privacy policy                               | Public         |
| `/sign-in`               | Email / Google sign-in                       | Guest only     |
| `/sign-up`               | Account registration                         | Guest only     |
| `/select-role`           | Role selection (Customer / Provider)         | New users      |
| `/dashboard`             | Customer or Provider dashboard               | Authenticated  |
| `/your-orders`           | Order history & status tracking              | CUSTOMER       |
| `/profile`               | View & edit personal profile                 | Authenticated  |
| `/admin`                 | Admin overview dashboard                     | ADMIN          |
| `/admin/customers`       | Manage customer accounts                     | ADMIN          |
| `/admin/providers`       | Manage provider accounts                     | ADMIN          |
| `/admin/meals`           | Manage all meals on the platform             | ADMIN          |
| `/admin/categories`      | Manage meal categories                       | ADMIN          |
| `/admin/orders`          | View & manage all orders                     | ADMIN          |
| `/admin/reviews`         | Moderate reviews                             | ADMIN          |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** v9+
- A running instance of the [FoodHub Backend](../FoodHub-Backend/)
- (Optional) ImgBB API key for image uploads

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd foodhub-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000**.

> Make sure the backend is running at **http://localhost:5000** (or update `NEXT_PUBLIC_BETTER_AUTH_URL` accordingly).

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PROD_APP_URL=http://localhost:3000
PROD_APP_URL=http://localhost:3000
NODE_ENV=localhost

# Backend API URL (used for rewrites & auth)
BETTER_AUTH_URL=http://localhost:5000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5000

# Auth secret (must match backend)
BETTER_AUTH_SECRET=your_secret_key_here

# ImgBB (for image uploads)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# AI Features (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

### API Proxy (next.config.ts)

The frontend proxies all backend API calls through Next.js rewrites — no CORS issues in the browser:

| Frontend Path           | Proxied To (Backend)          |
|-------------------------|-------------------------------|
| `/api/auth/*`           | `{BACKEND_URL}/api/auth/*`    |
| `/api/meals`            | `{BACKEND_URL}/meals`         |
| `/api/categories`       | `{BACKEND_URL}/categories`    |
| `/api/admin/*`          | `{BACKEND_URL}/admin/*`       |
| `/api/select-role`      | `{BACKEND_URL}/select-role`   |
| `/orders/*`             | `{BACKEND_URL}/orders/*`      |
| `/profile/*`            | `{BACKEND_URL}/profile/*`     |
| `/reviews/*`            | `{BACKEND_URL}/reviews/*`     |

---

## 📜 Scripts

| Script    | Command         | Description                                    |
|-----------|-----------------|------------------------------------------------|
| `dev`     | `npm run dev`   | Start Next.js development server (port 3000)   |
| `build`   | `npm run build` | Build production bundle                        |
| `start`   | `npm run start` | Start production server                        |
| `lint`    | `npm run lint`  | Run ESLint                                     |

---

## ☁️ Deployment

The frontend is deployed on **Vercel** with automatic CI/CD.

### Deploy manually

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Make sure all environment variables are configured in your **Vercel project settings** before deploying, especially:
- `NEXT_PUBLIC_BETTER_AUTH_URL` → production backend URL
- `BETTER_AUTH_SECRET` → same value as the backend
- `NEXT_PUBLIC_IMGBB_API_KEY`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is private and unlicensed. All rights reserved.
