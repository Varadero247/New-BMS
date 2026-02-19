FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/charts/package.json ./packages/charts/
COPY packages/types/package.json ./packages/types/
COPY apps/web-project-management/package.json ./apps/web-project-management/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-project-management/node_modules ./apps/web-project-management/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/ui build
RUN pnpm --filter=@ims/charts build
RUN pnpm --filter=@ims/web-project-management build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web-project-management/public ./apps/web-project-management/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-project-management/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-project-management/.next/static ./apps/web-project-management/.next/static

USER nextjs
EXPOSE 3009
ENV PORT=3009
CMD ["node", "apps/web-project-management/server.js"]
