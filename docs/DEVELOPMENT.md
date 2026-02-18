# Development Guide — Nexara IMS

## Prerequisites

| Tool       | Version | Install                                       |
| ---------- | ------- | --------------------------------------------- |
| Node.js    | 20.x    | `nvm install 20 && nvm use 20`                |
| pnpm       | 8+      | `npm install -g pnpm`                         |
| PostgreSQL | 14+     | See OS-specific instructions below            |
| Redis      | 6+      | Via Docker or system package                  |
| Docker     | 20+     | For Redis and optional containerised services |

### Ubuntu/Debian

```bash
sudo apt-get update && sudo apt-get install -y build-essential postgresql redis-server
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### macOS

```bash
brew install node@20 pnpm postgresql@14 redis
```

---

## CRITICAL First Step — EMFILE Fix

> **This monorepo opens 3,000+ file watchers. Without this fix, dev will crash immediately.**

```bash
# Add to ~/.bashrc or ~/.zshrc — do this BEFORE anything else
echo "ulimit -n 65536" >> ~/.bashrc && source ~/.bashrc

# Verify
ulimit -n
# Should print: 65536
```

---

## First-Time Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd New-BMS

# 2. Set file descriptor limit (see above)
ulimit -n 65536

# 3. Install dependencies
pnpm install

# 4. Create environment file
cp .env.example .env
# Edit .env with your database credentials, JWT_SECRET, etc.

# 5. Start PostgreSQL and Redis
# If using Docker:
docker compose up -d postgres redis
# If using system services:
sudo systemctl start postgresql redis

# 6. Push database schema
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" \
  npx prisma@5.22.0 db push --schema=packages/database/prisma/schema.prisma

# 7. Generate Prisma client
npx prisma@5.22.0 generate --schema=packages/database/prisma/schema.prisma

# 8. Seed the database
PGPASSWORD=${POSTGRES_PASSWORD} \
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" \
npx tsx packages/database/prisma/seed.ts
```

---

## Starting Development

### Full stack (all services)

```bash
ulimit -n 65536 && pnpm dev --filter='!@ims/mobile'
```

### Individual module (web + API + gateway)

```bash
pnpm dev:health-safety    # H&S module
pnpm dev:environment      # Environment module
pnpm dev:quality          # Quality module
pnpm dev:hr               # HR module
pnpm dev:payroll          # Payroll module
pnpm dev:inventory        # Inventory module
pnpm dev:workflows        # Workflows module
pnpm dev:settings         # Settings + AI
pnpm dev:dashboard        # Dashboard + Gateway
```

### Just APIs or just web apps

```bash
pnpm dev:apis             # All API services
pnpm dev:web              # All web apps
```

### Single service

```bash
pnpm --filter @ims/api-gateway dev
pnpm --filter @ims/web-dashboard dev
```

---

## Hot Reload

- **API services** use `tsx watch` — changes in `src/` trigger instant restart
- **Web apps** use Next.js Fast Refresh — component changes update instantly
- **Packages** use `tsup --watch` in dev mode (`--no-dts` to prevent hanging)
- When a package changes, consuming apps pick up the change after tsup rebuilds

---

## Adding a New API Service

1. Create directory structure:

```
apps/api-[name]/
├── src/
│   ├── index.ts        # Express app setup
│   ├── prisma.ts       # Re-export from @ims/database/<domain>
│   └── routes/
│       └── [resource].ts
├── __tests__/
│   └── [resource].test.ts
├── package.json
├── tsconfig.json
└── .env
```

2. `package.json`:

```json
{
  "name": "@ims/api-[name]",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@ims/auth": "workspace:*",
    "@ims/database": "workspace:*",
    "@ims/monitoring": "workspace:*",
    "@ims/rbac": "workspace:*",
    "@ims/types": "workspace:*",
    "express": "^4.18.0"
  }
}
```

3. Register the port in `apps/api-gateway/src/index.ts` SERVICES object
4. Add proxy middleware in the gateway
5. Add the CORS origin for the corresponding web app
6. Add to `scripts/start-all-services.sh` and `scripts/check-services.sh`

## Adding a New Web App

1. Create with Next.js App Router structure
2. Set the port via `-p PORT` in `package.json` dev script:
   ```json
   "dev": "next dev -p 3025"
   ```
3. Add the port to the gateway's CORS `DEFAULT_ORIGINS` array

## Adding a New Package

```
packages/[name]/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── __tests__/
    └── [name].test.ts
```

```json
{
  "name": "@ims/[name]",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsup src/index.ts --format cjs,esm --watch --no-dts",
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "test": "jest"
  }
}
```

Then run `pnpm install` and reference it in consuming apps:

```json
"@ims/[name]": "workspace:*"
```

---

## Script Reference

| Script    | Command                           | Description                   |
| --------- | --------------------------------- | ----------------------------- |
| dev       | `pnpm dev`                        | Start all services            |
| build     | `pnpm turbo build`                | Build all packages and apps   |
| test      | `pnpm test`                       | Run all Jest tests (~8,037)   |
| lint      | `pnpm turbo lint`                 | Lint all packages             |
| clean     | `pnpm turbo clean`                | Remove dist/.next dirs        |
| start:all | `./scripts/start-all-services.sh` | Background start all services |
| stop:all  | `./scripts/stop-all-services.sh`  | Stop all services             |
| check     | `./scripts/check-services.sh`     | Health check all services     |

---

## VS Code Extensions

- ESLint
- Prettier - Code Formatter
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Nightly

### Recommended settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "tailwindCSS.experimental.classRegex": [["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]]
}
```
