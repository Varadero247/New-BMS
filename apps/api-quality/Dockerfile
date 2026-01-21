FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/auth/package.json ./packages/auth/
COPY packages/calculations/package.json ./packages/calculations/
COPY apps/api-quality/package.json ./apps/api-quality/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter=@ims/database build
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/auth build
RUN pnpm --filter=@ims/calculations build
RUN pnpm --filter=@ims/api-quality build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-quality/dist ./apps/api-quality/dist
COPY --from=builder /app/apps/api-quality/package.json ./apps/api-quality/
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/api-quality
EXPOSE 4003
CMD ["node", "dist/index.js"]
