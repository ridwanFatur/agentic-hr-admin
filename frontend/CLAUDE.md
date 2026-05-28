# CLAUDE.md — Frontend

## Project

This is the **Next.js 16 frontend** for an **HR Management Application**.

Features:

- Google OAuth 2.0 login (redirect flow via FastAPI)
- JWT session management (localStorage)
- Dashboard with company/employee stats
- Company CRUD with logo upload
- Employee CRUD with photo upload
- HR tabs per employee: Attendance, Leave, Payroll, Performance (full CRUD with modals)
- User profile page with avatar upload
- Left sidebar navigation (desktop fixed, mobile drawer)
- Floating chatbot UI (dummy — no backend)
- Full mobile responsiveness

---

## Stack

- **Next.js 16** — App Router, TypeScript
- **Tailwind CSS v4** — all styling (no CSS modules, no inline styles)
- **Axios** — all API requests from page components
- `fetch` — used only in Next.js Route Handlers (server-side)

No additional UI libraries. Avoid unnecessary dependencies.

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Only one env var. No Google credentials on the frontend — those stay in FastAPI.

---

## Commands

All commands run from `frontend/`.

```bash
npm install       # install deps
npm run dev       # dev server → http://localhost:3000
npm run build     # production build (runs TypeScript check)
npm run lint      # ESLint
```

---

## Authentication Flow

Google OAuth uses a redirect flow. All Google credentials live in FastAPI.

```
User clicks "Continue with Google"
  → GET  /api/auth/google          (Next.js route handler)
  → GET  /api/v1/auth/google/auth-url  (FastAPI → generates URL + CSRF state)
  → stores state in httpOnly cookie "oauth_state"
  → 302 redirect → Google consent screen
  → Google → GET /redirect/login?code=xxx&state=xxx
  → POST /api/auth/exchange         (Next.js route handler)
      verifies state cookie
  → POST /api/v1/auth/google/callback  (FastAPI → exchanges code, returns JWT)
  → saveSession() → localStorage
  → redirect to /
```

**Session storage** (`lib/auth/session.ts`): `access_token`, `refresh_token`, `auth_user` in `localStorage`.

**Route protection**: pages call `useAuthGuard()` hook (via `useEffect`) which checks `isAuthenticated()` and does `router.replace("/login")` if false. No middleware or server-side auth check.

**Axios interceptor** (`lib/api/axios.ts`): attaches `Authorization: Bearer <token>` on every request; redirects to `/login` on 401.

---

## Folder Structure

```
app/
├── api/auth/
│   ├── google/route.ts       # Next.js route handler: initiate OAuth
│   └── exchange/route.ts     # Next.js route handler: exchange code → JWT
├── companies/
│   ├── page.tsx              # Company list
│   ├── new/page.tsx          # Create company
│   └── [id]/
│       ├── page.tsx          # Company detail + employee preview
│       ├── edit/page.tsx     # Edit company
│       └── employees/
│           ├── page.tsx              # Full employee table with search
│           ├── new/page.tsx          # Create employee
│           └── [employeeId]/
│               ├── page.tsx          # Employee detail + HR tabs
│               └── edit/page.tsx     # Edit employee
├── login/page.tsx            # Split-screen login page
├── profile/page.tsx          # User profile + avatar upload
├── redirect/login/page.tsx   # OAuth callback handler
├── page.tsx                  # Dashboard (protected)
└── layout.tsx                # Root layout

components/
├── auth/
│   └── GoogleLoginButton.tsx
├── companies/
│   ├── CompanyCard.tsx
│   └── CompanyForm.tsx
├── employees/
│   ├── EmployeeCard.tsx
│   └── EmployeeForm.tsx
├── layout/
│   ├── MainLayout.tsx        # Sidebar + mobile top bar + Chatbot
│   ├── Navbar.tsx            # (legacy; Sidebar is now primary)
│   └── Sidebar.tsx           # Desktop fixed + mobile drawer
└── ui/
    ├── Badge.tsx             # Status badges with variants
    ├── Chatbot.tsx           # Floating chatbot FAB + chat window
    ├── Dialog.tsx            # Confirmation/modal dialog
    └── LoadingSpinner.tsx    # sm / md / lg sizes

hooks/
└── useAuthGuard.ts           # Auth check hook used by all protected pages

lib/
├── api/
│   ├── axios.ts              # Axios instance with Bearer interceptor + 401 redirect
│   ├── cache.ts              # Lightweight in-memory TTL cache (withCache)
│   ├── companies.ts          # companiesApi: CRUD + uploadLogo
│   ├── employees.ts          # employeesApi: CRUD + uploadPhoto
│   ├── hr.ts                 # attendanceApi, leaveApi, payrollApi, performanceApi
│   └── users.ts              # usersApi: me, uploadAvatar
├── auth/
│   ├── session.ts            # saveSession, clearSession, getUser, updateUser, isAuthenticated, getRefreshToken
│   └── types.ts              # AuthUser interface
├── types/
│   └── hr.ts                 # Company, Employee, Attendance, Leave, Payroll, Performance + Create/Update/ListResponse
└── utils/
    └── cn.ts                 # clsx + tailwind-merge helper
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Split-screen: left panel (dark slate-900, hero text), right panel (Google sign-in) |
| `/redirect/login` | OAuth callback; exchanges code, saves session, redirects to `/` |
| `/` | Dashboard: welcome banner, stat cards (companies, employees), recent companies grid |
| `/companies` | Company list with cards; search by name; empty state |
| `/companies/new` | Create company form |
| `/companies/[id]` | Company detail: info card + logo upload + employee preview (first 10) |
| `/companies/[id]/edit` | Edit company form |
| `/companies/[id]/employees` | Full employee table with live search filter |
| `/companies/[id]/employees/new` | Create employee form |
| `/companies/[id]/employees/[employeeId]` | Employee detail with 5 tabs: Overview, Attendance, Leave, Payroll, Performance |
| `/companies/[id]/employees/[employeeId]/edit` | Edit employee form |
| `/profile` | Current user profile: avatar upload, account info grid |

---

## Key Components

### `MainLayout`

- Wraps all authenticated pages
- Renders `<Sidebar>` + mobile top bar (hamburger button)
- Renders `<Chatbot>` floating component
- Props: `children`, `user: AuthUser | null`

### `Sidebar`

- **Desktop**: `hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64` — always visible
- **Mobile**: `fixed inset-y-0 left-0 z-50 w-64` with `translate-x-0` / `-translate-x-full` CSS transition
- **Mobile overlay**: `fixed inset-0 z-40 bg-black/40 backdrop-blur-sm` — closes drawer on click
- Closes automatically on route change (`useEffect` on `pathname`) and Escape key
- Nav items: Dashboard (`/`), Companies (`/companies`), Profile (`/profile`)
- Bottom section: user avatar/initials, name, email, sign-out button
- Sign-out calls `POST /api/v1/auth/logout` then `clearSession()` and redirects to `/login`
- Content area offset: `lg:pl-64` in `MainLayout`

### `Chatbot`

- FAB button: `fixed bottom-5 right-5 z-50`
- Expands to chat window (350px wide, blue header with online indicator)
- Typing animation: 3 bouncing dots with `animation-delay`
- Bot replies with random canned responses after ~1 second delay
- No backend/AI — UI-only dummy

### `Dialog`

- Props: `open`, `onClose`, `title`, `description`, `actions`, `closeOnBackdrop`
- Handles: Escape key, scroll lock, focus management
- Use for all confirmation flows (delete, etc.)

### `Badge`

- Props: `label`, `variant`
- Exports `companyStatusVariant(status)` and `employmentStatusVariant(status)` helpers

---

## API Clients

### `lib/api/axios.ts`

- Axios instance with `baseURL: process.env.NEXT_PUBLIC_API_URL`
- Request interceptor: attaches `Authorization: Bearer <token>`
- Response interceptor: on 401, calls `clearSession()` and redirects to `/login`

### `lib/api/cache.ts`

```ts
withCache(key: string, fetchFn: () => Promise<T>, ttlMs?: number): Promise<T>
```
Default TTL: 30 seconds. Use to deduplicate API calls within a page load.

### `lib/api/companies.ts` — `companiesApi`

`list`, `get`, `create`, `update`, `delete`, `uploadLogo`

### `lib/api/employees.ts` — `employeesApi`

`list`, `get`, `create`, `update`, `delete`, `uploadPhoto`

### `lib/api/hr.ts`

Four clients: `attendanceApi`, `leaveApi`, `payrollApi`, `performanceApi`

Each has: `list(companyId, employeeId)`, `create(...)`, `update(...)`, `delete(...)`

### `lib/api/users.ts` — `usersApi`

`me()` — fetches current user from `/api/v1/users/me`  
`uploadAvatar(file)` — uploads to `/api/v1/users/me/avatar`, returns updated `AuthUser`

---

## Auth Session Helpers (`lib/auth/session.ts`)

| Function | Description |
|----------|-------------|
| `saveSession(data)` | Stores tokens + user in localStorage |
| `clearSession()` | Removes all auth keys from localStorage |
| `getUser()` | Returns `AuthUser \| null` from localStorage |
| `updateUser(user)` | Persists updated user to localStorage (used after avatar upload) |
| `isAuthenticated()` | Returns `true` if access_token is present |
| `getRefreshToken()` | Returns refresh token string or null |

---

## Route Handlers (Server-Side)

Located in `app/api/auth/`:

- `google/route.ts` — fetches Google OAuth URL from FastAPI, stores `oauth_state` in httpOnly cookie, returns redirect
- `exchange/route.ts` — verifies state cookie, POSTs code to FastAPI `/auth/google/callback`, returns token response

These use `fetch` directly (not Axios) because they run server-side.

---

## Conventions

### Button cursor rule (enforced)

Every `<button>` must have `cursor-pointer`. Disabled buttons must also have `disabled:cursor-not-allowed`:

```tsx
// ✅ Correct
<button className="cursor-pointer rounded-lg ...">Action</button>

// ✅ Correct (disabled)
<button disabled className="cursor-pointer ... disabled:cursor-not-allowed disabled:opacity-60">
  Saving…
</button>

// ❌ Wrong
<button className="rounded-lg ...">Action</button>
```

### `useSearchParams()` rule

Any component that calls `useSearchParams()` must be wrapped in `<Suspense>` — Next.js build requirement:

```tsx
export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
```

### API requests

- Page components → always use the Axios instance (`lib/api/axios.ts`)
- Next.js route handlers (`app/api/`) → use `fetch` directly (server-side)

### Styling

- Tailwind CSS only — no inline styles, no CSS modules
- Responsive: mobile-first; breakpoints `sm:`, `lg:`
- Color palette: blue-600 primary, gray-50/100 backgrounds, red-600 danger

### New Google users

When a user signs in via Google for the first time, `profile_picture` is set to `null` by the backend. The frontend shows initials (first letters of name parts) as fallback in all avatar displays.

---

## Types (`lib/types/hr.ts`)

Key interfaces:

- `Company` — includes `employee_range?: string` (not a number count)
- `Employee` — `gender: "male" | "female"`, `employment_status`, `photo_url?`
- `Attendance` — `date`, `check_in?`, `check_out?`, `status`, `notes?`
- `Leave` — `start_date`, `end_date`, `leave_type`, `status`, `reason?`
- `Payroll` — `period`, `gross_salary`, `deductions`, `net_salary`, `paid_at?`
- `Performance` — `review_date`, `rating` (1–5), `reviewer?`, `notes?`

---

## Employee Detail Page — HR Tabs

`app/companies/[id]/employees/[employeeId]/page.tsx` has 5 tabs:

1. **Overview** — employee info fields + photo upload
2. **Attendance** — table + add/edit/delete modals
3. **Leave** — table + add/edit/delete modals
4. **Payroll** — table + add/edit/delete modals; live net salary preview computed client-side
5. **Performance** — table + add/edit/delete modals; star rating display

All CRUD operations use inline modals (no navigation to separate pages).

---

## Guidance for Claude

When generating code:

- Follow existing folder structure
- Use `useAuthGuard()` on all protected page components
- Use `MainLayout` as the wrapper for all authenticated pages
- Keep page components thin — extract complex UI into `components/`
- Use the existing API clients in `lib/api/` — do not use `fetch` in page components
- Handle loading states with `LoadingSpinner`
- Use `Dialog` for all confirmation flows
- Tailwind CSS only
- Every `<button>` needs `cursor-pointer`
- Mobile-first, responsive

Prefer solutions that are:

**simple, maintainable, scalable**
