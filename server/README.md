# Server Directory

⚠️ **You are in the SERVER directory!**

## Important Notice

Most commands should be run from the **ROOT directory** of the project, not from here.

### Quick Navigation

```bash
# Go back to root directory
cd ..

# Now run commands like:
npm run install:all     # Install all dependencies
npm run start:client    # Start the client
npm run start:server    # Start this server
```

### Need Help?

```bash
# Show help message
npm run help

# Or go to root and read the documentation
cd ..
cat README.md
cat GETTING-STARTED.md
```

### When to Work Here?

You should only work in this directory when:
- Editing server code in `index.js` or other server files
- Adding server-specific dependencies: `npm install <package>`
- Running server-specific scripts: `npm start`, `npm run dev`

### Available Commands (Server Only)

- `npm start` - Start Node.js server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run help` - Show help message

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
# Edit .env with your configuration
```

---

**For all other tasks, go back to the root directory!**

```bash
cd ..
```
