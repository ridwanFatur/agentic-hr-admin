# Next.js Frontend

A clean and scalable **Next.js frontend** built for a FastAPI backend authentication system.  
This frontend is focused on **Google Authentication**, with a structured architecture for future scalability and maintainability.

The application uses:

- **Next.js (App Router)**
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Google OAuth Login**
- **Request Caching** for cleaner API handling
- **Reusable Layout System**
- **Environment-based Configuration**

---

## Features

### Authentication

This frontend only supports **Google Authentication**.

Authentication flow:

1. User clicks **Login with Google**
2. User is redirected to Google OAuth
3. After successful login, Google redirects to:

```env
GOOGLE_REDIRECT_URI=http://localhost:3000/redirect/login
```

4. Frontend receives the Google authentication response
5. Authentication token is sent to the FastAPI backend
6. Backend verifies the Google token
7. Backend generates JWT access & refresh tokens
8. User session is established

---

## Pages

### Login Page

A dedicated login page for user authentication.

Features:

- Google Sign-In
- Clean UI
- Redirect handling
- Authentication state management

---

### Home Page

Authenticated landing page.

Features:

- Protected route
- Shared layout structure
- Clean component organization

---

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Authentication:** Google OAuth
- **State Handling:** Client-side auth session
- **Caching:** Request-level caching
- **Environment Management:** `.env`

---

## Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This value is used to connect the frontend to the FastAPI backend.

---

## Backend Configuration

The frontend is designed to work with the following backend configuration:

```env
# App
PROJECT_NAME=app-backend
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Database
DATABASE_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/redirect/login

# JWT
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Project Structure

```txt
frontend/
├── app/
│   ├── login/
│   ├── redirect/
│   │   └── login/
│   ├── page.tsx
│   └── layout.tsx
│
├── components/
│   ├── layout/
│   ├── ui/
│   └── auth/
│
├── lib/
│   ├── api/
│   │   ├── axios.ts
│   │   └── cache.ts
│   ├── auth/
│   └── utils/
│
├── public/
├── styles/
├── .env
└── package.json
```

---

## Request Caching

This frontend includes a lightweight request caching mechanism to improve performance and reduce unnecessary API calls.

Benefits:

- Prevent duplicate requests
- Faster response handling
- Cleaner API management
- Better user experience

Caching is implemented at the API request level using a centralized request layer.

---

## API Communication

All API requests are handled through a centralized **Axios instance**.

Features:

- Shared configuration
- Base URL from environment variables
- Request interceptors
- Response interceptors
- Token handling
- Error handling
- Request caching

Example configuration:

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd frontend
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

Create:

```env
.env
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run Development Server

```bash
pnpm dev
```

Application will run at:

```txt
http://localhost:3000
```

---

## Authentication Flow

```txt
Login Page
    ↓
Google OAuth
    ↓
Redirect to:
http://localhost:3000/redirect/login
    ↓
Frontend receives auth response
    ↓
Send token to FastAPI backend
    ↓
Backend verifies Google token
    ↓
JWT access & refresh token generated
    ↓
Authenticated session
    ↓
Redirect to Home Page
```

---

## Design Principles

This frontend follows a **clean and maintainable architecture**:

- Minimal and scalable folder structure
- Centralized API handling
- Reusable layouts and UI components
- Environment-based configuration
- Clean authentication flow
- Performance optimization through request caching
- Easy backend integration

---

## Development Notes

- Frontend runs on `localhost:3000`
- Backend runs on `localhost:8000`
- Google OAuth redirect must match backend configuration
- `NEXT_PUBLIC_API_URL` must point to the backend server
- Tailwind CSS is used for all styling
- Axios handles all HTTP requests
- Authentication only supports Google Login