# Deployment Instructions for Egypt Advisor Tours

This project is deployed to [Hostinger](https://www.hostinger.com/) at **https://egyptadvisortours.com** via an automated GitHub Actions workflow (`.github/workflows/deploy-hostinger.yml`). Every push to the `main` branch triggers an SSH-based deploy that pulls the latest code, rebuilds the React client, and restarts the Node.js app on the server.

> **Note:** Vercel GitHub deployments are explicitly disabled (`"github": { "enabled": false }` in `vercel.json` at the repo root). Do **not** attempt to deploy this project through Vercel's GitHub integration.

## One-Time Setup (Hostinger + GitHub Actions)

Follow these steps once before the first automated deployment.

### 1. Configure a Node.js Application in Hostinger hPanel

1. Log in to [hPanel](https://hpanel.hostinger.com/).
2. Go to **Websites → egyptadvisortours.com → Node.js**.
3. Set:
   - **Node.js version**: 18 (LTS) or higher
   - **Application root**: the directory where the repo will be deployed, e.g. `/home/u123456789/egyptadvisortours.com`
   - **Startup file**: `index.js`
4. Click **Create / Save**.

### 2. Enable SSH Access

1. In hPanel, go to **Advanced → SSH Access → Enable**.
2. Note your SSH **hostname** (e.g. `server123.web-hosting.com`), **username**, and **port** (usually `65002` on shared/business plans).

### 3. Create a Deploy SSH Key Pair

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/hostinger_deploy
```

Add the **public key** (`~/.ssh/hostinger_deploy.pub`) to Hostinger:  
**hPanel → Advanced → SSH Access → Manage SSH Keys → Add SSH Key**

### 4. Add GitHub Repository Secrets

Go to **GitHub → Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Example / description |
|---|---|
| `HOSTINGER_SSH_HOST` | `server123.web-hosting.com` |
| `HOSTINGER_SSH_PORT` | `65002` |
| `HOSTINGER_SSH_USER` | `u123456789` |
| `HOSTINGER_SSH_KEY` | Content of `~/.ssh/hostinger_deploy` (private key) |
| `HOSTINGER_APP_DIR` | `/home/u123456789/egyptadvisortours.com` |
| `HOSTINGER_SSH_KNOWN_HOSTS` | Output of `ssh-keyscan -p <PORT> <HOST>` |
| `ADMIN_SECRET` | A long random string that protects `/api` write endpoints |

**Optional** (only required if you use EmailJS):

| Secret name |
|---|
| `REACT_APP_EMAILJS_SERVICE_ID` |
| `REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID` |
| `REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID` |
| `REACT_APP_EMAILJS_PUBLIC_KEY` |

**Optional** (persist admin edits across deploys):

| Secret name | Description |
|---|---|
| `HOSTINGER_DATA_PATH` | Absolute path outside the repo checkout where JSON data files are stored (e.g. `/home/u123456789/app-data`). When set, admin saves survive `git pull` resets. |

## How Automated Deploys Work

After completing the one-time setup, every push to `main`:

1. **Validates** all required secrets are present (fails fast if any are missing).
2. **Bootstraps** the repository on the server if it is a first deploy (runs `git init`, `git fetch`, `git reset`).
3. **Writes** build-time env vars (`REACT_APP_*`) to `client/.env.production.local` and the runtime `ADMIN_SECRET` to `.env` on the server.
4. **Pulls** the latest code (`git pull origin main`).
5. **Installs** dependencies (`npm install`), which triggers the `postinstall` hook that builds the React client via `scripts/build-client.js`.
6. **Removes** the temporary build env file.
7. **Restarts** the Node.js application (via `touch tmp/restart.txt` for Passenger, or PM2).

The live site is available at **https://egyptadvisortours.com** once the workflow completes.

## Manual Redeploy

To trigger a deploy without a code change (e.g. after updating GitHub Secrets):

- Go to **GitHub → Actions → Deploy to Hostinger → Run workflow**.

> **Reminder:** Changing only GitHub Secrets does **not** automatically rebuild the React bundle. You must also push a code change or run `npm install` manually on the server so the new env values are embedded.