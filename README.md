# BMS - Building Management System

A full-stack Building Management System with real-time monitoring, device control, and energy management.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Mobile**: Capacitor (iOS/Android)
- **Monorepo**: pnpm workspaces + Turborepo

## Project Structure

```
bms-monorepo/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express backend
│   └── mobile/       # Capacitor mobile app
├── packages/
│   ├── database/     # Prisma schema and client
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
└── turbo.json
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Docker (optional)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

Copy the example env file and configure:

```bash
cp .env.example .env
```

### 3. Start Database

Using Docker:

```bash
docker-compose up -d postgres
```

Or use your local PostgreSQL installation.

### 4. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data
pnpm --filter @bms/database seed
```

### 5. Start Development

```bash
# Start all apps
pnpm dev

# Or start individually
pnpm --filter @bms/api dev    # API on :4000
pnpm --filter @bms/web dev    # Web on :3000
pnpm --filter @bms/mobile dev # Mobile on :5173
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Demo Credentials

```
Email: admin@bms.local
Password: admin123
```

## Mobile Development

### iOS

```bash
cd apps/mobile
pnpm build
npx cap add ios
npx cap open ios
```

### Android

```bash
cd apps/mobile
pnpm build
npx cap add android
npx cap open android
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/buildings` | List buildings |
| `GET /api/devices` | List devices |
| `GET /api/alerts` | List alerts |
| `GET /api/energy/stats` | Energy statistics |
| `GET /api/dashboard/stats` | Dashboard stats |

## Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## License

MIT
