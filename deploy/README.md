# Deploying MseeZee to the VPS

One-time setup, in order. After this, every push to `main` (that touches
`apps/web`, `packages/shared`, or the workflow file) redeploys automatically —
GitHub Actions builds the image, pushes it to GHCR, then SSHes in to pull and
restart. Nothing builds on the VPS itself; the 2GB box only ever runs a
finished image.

## 1. Find out how Postgres is set up

```bash
systemctl status postgresql        # native install?
docker ps | grep postgres          # or containerized?
```

**If native**, create MseeZee's own database and user (never reuse another
project's):

```bash
sudo -u postgres psql
CREATE DATABASE mseezee;
CREATE USER mseezee WITH ENCRYPTED PASSWORD 'pick something long and random';
GRANT ALL PRIVILEGES ON DATABASE mseezee TO mseezee;
\c mseezee
GRANT ALL ON SCHEMA public TO mseezee;
\q
```

Confirm it's reachable on `localhost:5432` (check `listen_addresses` in
`postgresql.conf` and that `pg_hba.conf` allows local password auth — it
usually does by default).

**If containerized**, note which Docker network it's on — `deploy/docker-compose.yml`
has a comment on the alternative (non-host-networking) setup for that case.

## 2. Set up `/opt/mseezee` on the VPS

```bash
ssh youruser@your-vps
sudo mkdir -p /opt/mseezee && sudo chown $USER /opt/mseezee
```

Copy `deploy/docker-compose.yml` there as `/opt/mseezee/docker-compose.yml`,
replacing `OWNER` in the image line with your GitHub username/org.

Copy `deploy/.env.production.example` there as `/opt/mseezee/.env` and fill it
in — the real `DATABASE_URL` (from step 1), a fresh `AUTH_SECRET`
(`openssl rand -base64 32`), and the rest. This file never goes in git.

## 3. Let the VPS pull images from GHCR

Easiest: after the first push (step 6), make the package public —
GitHub → your profile → Packages → `mseezee-web` → Package settings → Change visibility.
No login needed on the VPS then.

If you'd rather keep it private, log in once on the VPS with a
[Personal Access Token](https://github.com/settings/tokens) scoped to
`read:packages`:

```bash
echo "$YOUR_PAT" | docker login ghcr.io -u your-github-username --password-stdin
```

## 4. Apache + HTTPS

```bash
sudo cp deploy/apache-mseezee.conf /etc/apache2/sites-available/mseezee.conf
sudo a2enmod proxy proxy_http headers
sudo a2ensite mseezee
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Point `mseezee.co.za`'s DNS **A record** at the VPS's IP first, then:

```bash
sudo certbot --apache -d mseezee.co.za -d www.mseezee.co.za
```

Certbot adds the `:443` block and redirects `:80` to it. **After it runs**,
open `/etc/apache2/sites-available/mseezee-le-ssl.conf` and add one line
inside the new `<VirtualHost *:443>` block (certbot doesn't add this itself):

```apache
RequestHeader set X-Forwarded-Proto "https"
```

This is what tells the app the original request was HTTPS — without it,
NextAuth's cookies and Paystack's callback URLs can end up pointed at `http://`.
Reload Apache again after adding it.

## 5. GitHub repo secrets

**Settings → Secrets and variables → Actions**, add:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | the VPS's IP or hostname |
| `VPS_USER` | the SSH user to deploy as |
| `VPS_SSH_KEY` | a **private** key (generate a dedicated deploy key: `ssh-keygen -t ed25519 -f deploy_key -N ""`, add `deploy_key.pub` to the VPS's `~/.ssh/authorized_keys`, paste `deploy_key`'s contents here) |

`GITHUB_TOKEN` is automatic — no need to add it.

## 6. First deploy

```bash
git push origin main
```

Watch it run under the repo's **Actions** tab. Once it's green:

```bash
ssh youruser@your-vps
cd /opt/mseezee
docker compose pull
docker compose up -d
docker compose logs -f    # watch it come up; first boot runs `prisma migrate deploy`
```

Visit `https://mseezee.co.za`. From then on, every push to `main` redeploys
without you touching the VPS again.

## Moving to a South Africa VPS later

Nothing above is Frankfurt-specific except the IP in DNS and `VPS_HOST`. To
move before the pilot: stand up the new VPS, repeat steps 1–4 there, point DNS
at the new IP, update `VPS_HOST` (and re-issue the SSH key), then delete the
old VirtualHost and Postgres database on the Frankfurt box once you've
confirmed the new one is serving traffic.
