FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/charts/package.json ./packages/charts/
COPY packages/types/package.json ./packages/types/
COPY packages/i18n/package.json ./packages/i18n/
COPY apps/web-emergency/package.json ./apps/web-emergency/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-emergency/node_modules ./apps/web-emergency/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/ui build
RUN pnpm --filter=@ims/charts build
RUN pnpm --filter=@ims/i18n build
RUN pnpm --filter=@ims/web-emergency build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web-emergency/public ./apps/web-emergency/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-emergency/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-emergency/.next/static ./apps/web-emergency/.next/static

USER nextjs
EXPOSE 3045
ENV PORT=3045
CMD ["node", "apps/web-emergency/server.js"]
