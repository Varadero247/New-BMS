FROM node:20-alpine AS base
RUN apk add --no-cache dumb-init && corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/auth/package.json ./packages/auth/
COPY packages/calculations/package.json ./packages/calculations/
COPY packages/monitoring/package.json ./packages/monitoring/
COPY apps/api-health-safety/package.json ./apps/api-health-safety/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api-health-safety/node_modules ./apps/api-health-safety/node_modules
COPY . .
RUN cd packages/database && pnpm install --no-frozen-lockfile && cd /app && pnpm --filter=@ims/database generate:all && pnpm --filter=@ims/database build
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/auth build
RUN pnpm --filter=@ims/calculations build
RUN pnpm --filter=@ims/monitoring build
RUN pnpm --filter=@ims/api-health-safety build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.modules.yaml ./node_modules/.modules.yaml
COPY --from=builder --chown=appuser:nodejs /app/packages ./packages
COPY --from=builder --chown=appuser:nodejs /app/apps/api-health-safety/dist ./apps/api-health-safety/dist
COPY --from=builder --chown=appuser:nodejs /app/apps/api-health-safety/package.json ./apps/api-health-safety/
COPY --from=builder --chown=appuser:nodejs /app/apps/api-health-safety/node_modules ./apps/api-health-safety/node_modules
COPY --chown=appuser:nodejs apps/api-health-safety/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER appuser
WORKDIR /app/apps/api-health-safety
EXPOSE 4001
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/health || exit 1
ENTRYPOINT ["dumb-init", "/entrypoint.sh"]
