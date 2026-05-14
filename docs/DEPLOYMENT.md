# Deployment Guide — Hostinger

## Prerequisites

- A Hostinger Business/Cloud plan (Node.js support required)
- SSH access enabled in hPanel
- This repo pushed to GitHub

---

## One-time server setup

### 1. Create the Node.js application in hPanel

1. hPanel → **Websites** → egyptadvisortours.com → **Node.js**
2. Set:
   - Node.js version: **20** (LTS)
   - Application root: e.g. `/home/u123456789/egyptadvisortours.com`
   - Startup file: `index.js`
3. Click **Create/Save**.

### 2. Enable SSH

hPanel → **Advanced** → **SSH Access** → Enable.  
Note your SSH hostname (e.g. `server123.web-hosting.com`) and port (usually `65002`).

### 3. Create a deploy SSH key pair

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/hostinger_deploy
```

Add the **public key** (`hostinger_deploy.pub`) to hPanel:  
hPanel → **Advanced** → **SSH Access** → **Manage SSH Keys** → Add SSH Key.

### 4. Add GitHub Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|---|---|
| `HOSTINGER_SSH_HOST` | e.g. `server123.web-hosting.com` |
| `HOSTINGER_SSH_PORT` | e.g. `65002` |
| `HOSTINGER_SSH_USER` | e.g. `u123456789` |
| `HOSTINGER_SSH_KEY_B64` | Base64-encoded contents of `~/.ssh/hostinger_deploy` (private key) |
| `HOSTINGER_APP_DIR` | e.g. `/home/u123456789/egyptadvisortours.com` |
| `HOSTINGER_SSH_KNOWN_HOSTS` | Output of `ssh-keyscan -p 65002 server123.web-hosting.com` |
| `ADMIN_SECRET` | A long random string (JWT signing key) — generate at https://generate-secret.now.sh/32 |
| `ADMIN_PASSWORD` | A secure password for the `/admin` login screen |
| `ADMIN_USERNAME` | Login username (default: `admin` — optional) |
| `HOSTINGER_DATA_PATH` | Absolute path for data files OUTSIDE the repo, e.g. `/home/u123456789/admin_data` (recommended) |

Optional EmailJS secrets (needed for booking/trip-tailor emails):

- `REACT_APP_EMAILJS_SERVICE_ID`
- `REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID`
- `REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID`
- `REACT_APP_EMAILJS_PUBLIC_KEY`

Create `HOSTINGER_SSH_KEY_B64` from your private key:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("hostinger_deploy"))
```

```bash
base64 -w 0 ~/.ssh/hostinger_deploy
```

---

## How deployment works

On every push to `main`, the GitHub Actions workflow (`.github/workflows/deploy-hostinger.yml`):

1. **Runs all tests** (server + client) — deploy is blocked if tests fail.
2. SSHes into Hostinger and writes env vars to `.env` and `client/.env.production.local`.
3. Runs `git pull origin main` on the server.
4. Runs `npm install` (which also rebuilds the React client via `postinstall`).
5. Restarts the Node.js app via `touch tmp/restart.txt`.
6. Runs a **health check** — curls `https://egyptadvisortours.com/health` and fails the workflow if it returns non-200.

---

## Persistent data directory (important!)

Admin-edited JSON files should live **outside** the repo checkout so `git pull` does not wipe them on each deploy.

Set `HOSTINGER_DATA_PATH` (GitHub Secret) to an absolute path such as `/home/u123456789/admin_data`.

The server reads `DATA_PATH` from `.env` and uses that directory for all data files.

---

## Nightly data backup

A scheduled GitHub Actions workflow (`.github/workflows/backup-data.yml`) runs at 03:00 UTC daily. It SSHes into Hostinger, downloads all JSON data files, and commits them to the `data-backup` branch.

To enable, create the `data-backup` branch once:
```bash
git checkout --orphan data-backup
git commit --allow-empty -m "init"
git push origin data-backup
```

---

## Manual deploy (without GitHub Actions)

```bash
ssh -p 65002 u123456789@server123.web-hosting.com
cd /home/u123456789/egyptadvisortours.com
git pull origin main
npm install --production=false
touch tmp/restart.txt
```
