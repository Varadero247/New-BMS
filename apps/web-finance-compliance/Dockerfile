FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/charts/package.json ./packages/charts/
COPY packages/types/package.json ./packages/types/
COPY apps/web-finance-compliance/package.json ./apps/web-finance-compliance/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-finance-compliance/node_modules ./apps/web-finance-compliance/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/ui build
RUN pnpm --filter=@ims/charts build
RUN pnpm --filter=@ims/web-finance-compliance build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web-finance-compliance/public ./apps/web-finance-compliance/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-finance-compliance/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-finance-compliance/.next/static ./apps/web-finance-compliance/.next/static

USER nextjs
EXPOSE 3038
ENV PORT=3038
CMD ["node", "apps/web-finance-compliance/server.js"]
