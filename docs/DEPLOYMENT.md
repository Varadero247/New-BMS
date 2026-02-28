# Deployment Guide — Nexara IMS

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


## Environment Variables

| Variable                     | Description                                          | Required   |
| ---------------------------- | ---------------------------------------------------- | ---------- |
| `DATABASE_URL`               | PostgreSQL connection string                         | Yes        |
| `JWT_SECRET`                 | Secret for signing JWT tokens                        | Yes        |
| `REDIS_URL`                  | Redis connection (default: `redis://localhost:6379`) | Yes        |
| `NODE_ENV`                   | `production` or `development`                        | Yes        |
| `PORT`                       | Gateway port (default: `4000`)                       | No         |
| `ALLOWED_ORIGINS`            | Comma-separated CORS origins                         | Production |
| `CSRF_ENABLED`               | Enable CSRF protection (`true`/`false`)              | No         |
| `PLATFORM_URL`               | Public platform URL (e.g. `https://app.nexara.io`)   | Production |
| `FOUNDER_EMAIL`              | Email for digest notifications                       | No         |
| `SERVICE_*_URL`              | URLs for downstream services                         | Docker/K8s |
| `HEALTH_SAFETY_DATABASE_URL` | Domain-specific DB URL                               | Yes        |
| `ENVIRONMENT_DATABASE_URL`   | Domain-specific DB URL                               | Yes        |
| `ISO42001_DATABASE_URL`      | Domain-specific DB URL                               | Yes        |
| `ISO37001_DATABASE_URL`      | Domain-specific DB URL                               | Yes        |
| `INVENTORY_DATABASE_URL`     | Domain-specific DB URL                               | Yes        |

---

## Production Build

```bash
pnpm turbo build --filter='!@ims/mobile'
```

---

## PM2 Process Management

### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'dist/index.js',
      cwd: './apps/api-gateway',
      env: { PORT: 4000, NODE_ENV: 'production' },
    },
    {
      name: 'api-health-safety',
      script: 'dist/index.js',
      cwd: './apps/api-health-safety',
      env: { PORT: 4001, NODE_ENV: 'production' },
    },
    // ... repeat for all 43 API services (ports 4000-4041 + 4050)
    {
      name: 'web-dashboard',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: './apps/web-dashboard',
      env: { NODE_ENV: 'production' },
    },
    // ... repeat for all 45 web apps (ports 3000-3046)
  ],
};
```

### Commands

```bash
pm2 start ecosystem.config.js
pm2 monit                      # Real-time monitoring
pm2 logs api-gateway           # View gateway logs
pm2 restart all                # Restart all services
pm2 save                       # Save process list
pm2 startup                    # Auto-start on boot
```

---

## Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/nexara

# Dashboard
server {
    listen 443 ssl;
    server_name app.nexara.io;

    ssl_certificate     /etc/letsencrypt/live/app.nexara.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.nexara.io/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Gateway
server {
    listen 443 ssl;
    server_name api.nexara.io;

    ssl_certificate     /etc/letsencrypt/live/api.nexara.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nexara.io/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for notifications
    location /ws {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

### SSL with Certbot

```bash
sudo certbot --nginx -d app.nexara.io -d api.nexara.io
```

---

## PostgreSQL Production Hardening

```ini
# postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 4MB

# pg_hba.conf — restrict to app server IP
host    ims    postgres    10.0.0.0/24    scram-sha-256
host    all    all         0.0.0.0/0      reject
```

Consider PgBouncer for connection pooling in production.

---

## Redis Production Config

```conf
# redis.conf
bind 127.0.0.1
requirepass YOUR_REDIS_PASSWORD
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## Health Check Endpoints

All services expose `GET /health` (no auth required):

```bash
curl http://localhost:4000/health   # Gateway
curl http://localhost:4001/health   # Health & Safety
# ... through :4026

# Check all at once:
./scripts/check-services.sh
```

---

## Docker

The project includes `docker-compose.yml` for the full stack.

```bash
# Start infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# Start all services
docker compose up -d
```

**Container requirements:**

- All Prisma schemas include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` for Alpine
- Docker API version: `DOCKER_API_VERSION=1.41` required for exec commands
- Individual Dockerfiles in `apps/api-*/Dockerfile` with `entrypoint.sh`

---

## Log Management

- **Turbo logs**: `.turbo/` directory
- **PM2 logs**: `~/.pm2/logs/`
- **Log rotation**: `pm2 install pm2-logrotate`

---

## Scaling Considerations

| Component    | Stateless? | Notes                                     |
| ------------ | ---------- | ----------------------------------------- |
| API services | Yes        | Can horizontally scale freely             |
| Web apps     | Yes        | Static after build, serve from CDN        |
| Gateway      | Mostly     | Rate limiting uses shared Redis state     |
| WebSockets   | No         | Use sticky sessions or Redis pub/sub      |
| PostgreSQL   | No         | Single primary, consider read replicas    |
| Redis        | No         | Single instance, consider Sentinel for HA |

---

## Startup/Shutdown Scripts

```bash
./scripts/startup.sh            # Full startup (kill port conflicts, start Docker, seed DB)
./scripts/start-all-services.sh # Start all 51 services with staggered delays
./scripts/stop-all-services.sh  # Stop all services (ports 3000-3030, 4000-4026)
./scripts/check-services.sh     # Health check all services
```
