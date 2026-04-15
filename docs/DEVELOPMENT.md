# Development Guide

## Prerequisites

- Node.js 20+, npm 9+
- Git

## Local setup

```bash
git clone https://github.com/jozoxm/egypt-advisor-tours.git
cd egypt-advisor-tours
cp .env.example .env   # fill in ADMIN_SECRET, ADMIN_PASSWORD, EmailJS keys
npm install            # installs all deps + builds the React client
```

### Running in development mode

```bash
# API server (hot-reload with nodemon)
npm run dev

# In a second terminal — React dev server (proxies /api/* to :5000)
cd client && npm start
```

### Running with Docker

```bash
cp .env.example .env
docker-compose up --build
# Open http://localhost:5000
```

---

## Project structure

```
egypt-advisor-tours/
├── index.js              # Entry point (requires server/index.js)
├── package.json          # Root dependencies + scripts
├── server/
│   ├── index.js          # Express app (API + static file serving)
│   ├── data/             # Runtime JSON data (gitignored, auto-seeded)
│   └── __tests__/        # Server integration tests (Jest + Supertest)
├── client/
│   ├── public/           # Static assets (index.html, logo, sitemap.xml, robots.txt)
│   └── src/
│       ├── App.js         # Public site layout (navbar, routes)
│       ├── context/
│       │   └── DataContext.jsx  # Centralised data fetching (React context)
│       ├── components/   # Reusable components (Navbar, Footer, BookingModal, …)
│       ├── pages/        # Route components (HomePage, TourDetail, AdminPanel, …)
│       ├── data/         # Static seed data (JS modules, mirrors server/data/)
│       └── __tests__/    # Client unit / component tests (Jest + RTL)
├── scripts/
│   └── build-client.js   # postinstall hook that builds the React app
├── docs/                 # Project documentation
├── .github/
│   └── workflows/
│       ├── deploy-hostinger.yml  # CI/CD: test → deploy
│       └── backup-data.yml       # Nightly data backup
├── docker-compose.yml
└── Dockerfile
```

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Run the Express server (serves both API and React build) |
| `npm run dev` | Run the Express server with nodemon (auto-restart on changes) |
| `npm run test:server` | Run server tests (Jest + Supertest) |
| `npm run test:client` | Run client tests (React Testing Library) |
| `npm run test:all` | Run all tests (server + client) |
| `npm run build` | Build only the React client |

---

## Environment variables

See `.env.example` for the full list with descriptions.

The key variables you need locally:

| Variable | Purpose |
|---|---|
| `ADMIN_SECRET` | JWT signing key (server-side) |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_USERNAME` | Admin login username (default: `admin`) |
| `REACT_APP_EMAILJS_*` | EmailJS credentials for booking/trip-tailor emails |

---

## Adding a new page

1. Create `client/src/pages/MyPage.jsx`
2. Add a route in `client/src/App.js` (or `client/src/index.js` for `/admin`)
3. Optionally fetch data via `useData()` from `DataContext`
4. Wrap the route element with `<ErrorBoundary>` for resilience

## Adding a new API endpoint

1. Add the route in `server/index.js`
2. Protect admin endpoints with the `requireAdminAuth` middleware
3. Add integration tests in `server/__tests__/server.test.js`

---

## Data flow

1. On startup, `seedDataFiles()` creates JSON files in `DATA_DIR` from static JS modules if they don't exist.
2. Public API endpoints (`GET /api/tours`, etc.) read from these JSON files, caching in memory.
3. Admin POST endpoints write updated data back to the JSON files.
4. The React `DataProvider` (context) fetches all public data once on mount and provides it to the whole app via `useData()`.
