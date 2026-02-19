FROM node:20-alpine AS base
RUN apk add --no-cache dumb-init && corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/auth/package.json ./packages/auth/
COPY packages/monitoring/package.json ./packages/monitoring/
COPY packages/secrets/package.json ./packages/secrets/
COPY packages/email/package.json ./packages/email/
COPY packages/service-auth/package.json ./packages/service-auth/
COPY apps/api-gateway/package.json ./apps/api-gateway/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/auth/node_modules ./packages/auth/node_modules
COPY --from=deps /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY . .
RUN cd packages/database && pnpm install --no-frozen-lockfile && cd /app && pnpm --filter=@ims/database generate:all && pnpm --filter=@ims/database build
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/auth build
RUN pnpm --filter=@ims/monitoring build
RUN pnpm --filter=@ims/secrets build
RUN pnpm --filter=@ims/email build
RUN pnpm --filter=@ims/service-auth build
RUN pnpm --filter=@ims/api-gateway build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.modules.yaml ./node_modules/.modules.yaml
COPY --from=builder --chown=appuser:nodejs /app/packages ./packages
COPY --from=builder --chown=appuser:nodejs /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder --chown=appuser:nodejs /app/apps/api-gateway/package.json ./apps/api-gateway/
COPY --from=builder --chown=appuser:nodejs /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --chown=appuser:nodejs apps/api-gateway/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER appuser
WORKDIR /app/apps/api-gateway
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1
ENTRYPOINT ["dumb-init", "/entrypoint.sh"]
