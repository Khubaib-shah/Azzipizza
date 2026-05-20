# 🍕 Azzipizza — Online Pizza Ordering Frontend

Azzipizza is a modern, responsive pizza ordering frontend built with React, Tailwind CSS, and Vite. It provides a smooth customer experience for browsing menu items, customizing orders, tracking status in real time, and completing secure checkout.

---

## 📌 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

---

## About

This repository contains the frontend application for Azzipizza. It is designed to work with a backend API and real-time order notification system, delivering an intuitive ordering flow for customers and a smooth admin experience for kitchen staff.

---

## Features

- 🍕 Menu browsing with pizza customization
- 🛒 Cart management and checkout flow
- 🔔 Real-time order updates using Socket.io
- 📱 Fully responsive layout for mobile and desktop
- 💳 Payment integration compatibility (Satispay / PayPal)
- 📄 Order history and tracking pages
- 🚨 Live notifications for new orders

---

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- ShadCN / Radix UI components
- React Router DOM
- Socket.io client
- Axios
- React Toastify
- Recharts

---

## Project Structure

```
azzipizza/
├── frontend/      # Customer-facing React app
├── admin/         # Kitchen/admin dashboard
├── backend/       # REST API server
```

This repo is the frontend package. The full monorepo includes separate `admin` and `backend` services.

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm 10+ installed
- Backend API available locally or remotely

### Install

```bash
# Clone the repository
git clone https://github.com/Khubaib-shah/azzipizza.git

# Change into the frontend folder
cd azzipizza/frontend

# Install dependencies
npm install
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

Create a `.env` file in `frontend/` with the following values:

```env
VITE_BASE_URL_DEV=http://localhost:5000
VITE_BASE_URL_PRO=https://your-production-backend.example.com
```

Use `VITE_BASE_URL_DEV` for local development and `VITE_BASE_URL_PRO` for production builds.

---

## Available Scripts

From the `frontend/` directory:

- `npm run dev` — start the development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint across the codebase

---

## Future Enhancements

- ✅ Add user authentication and profile management
- ✅ Improve checkout payment flows
- ✅ Add search and filtering for menu items
- ✅ Add order history and saved favorites
- ✅ Support multi-vendor or multi-restaurant setups

---

## Author

Built with ❤️ by Khubaib Shah

Feel free to star the repo, open issues, and contribute improvements.
