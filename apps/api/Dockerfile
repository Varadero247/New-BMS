# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY tsconfig.base.json ./

# Generate Prisma client
RUN pnpm --filter @bms/database generate

# Build packages
RUN pnpm --filter @bms/shared build
RUN pnpm --filter @bms/api build

# Production stage
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
