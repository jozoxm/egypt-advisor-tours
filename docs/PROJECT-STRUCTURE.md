# Project Structure

This project is organized as a monorepo with separate client and server directories.

## Directory Structure

```
egypt-advisor-tours/
├── client/           # React frontend application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   └── package.json  # Client dependencies
├── server/           # Node.js backend application
│   ├── index.js      # Server entry point
│   └── package.json  # Server dependencies
├── package.json      # Root package.json with convenience scripts
└── README.md         # Project documentation
```

## Available Scripts

From the root directory, you can run:

### `npm run install:all`
Installs dependencies for both client and server.

### `npm run install:client`
Installs dependencies for the client only.

### `npm run install:server`
Installs dependencies for the server only.

### `npm start` or `npm run start:client`
Starts the React development server on port 3000.

### `npm run start:server`
Starts the Node.js backend server.

### `npm run build`
Builds the React app for production.

### `npm test`
Runs the React test suite.

## First Time Setup

1. Clone the repository
2. Run `npm run install:all` from the root directory
3. Start the client with `npm start`

## Working with Individual Projects

### Client Development
```bash
cd client
npm install
npm start
```

### Server Development
```bash
cd server
npm install
node index.js
```

## Technology Stack

### Frontend (Client)
- React 17
- React Router v6
- Bootstrap 5
- Styled Components
- Axios

### Backend (Server)
- Node.js
- Express
- MongoDB/Mongoose
- Nodemailer
