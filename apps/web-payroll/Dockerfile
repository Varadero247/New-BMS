FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY apps/web-payroll/package.json ./apps/web-payroll/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-payroll/node_modules ./apps/web-payroll/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/ui build
RUN pnpm --filter=@ims/web-payroll build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web-payroll/public ./apps/web-payroll/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-payroll/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-payroll/.next/static ./apps/web-payroll/.next/static
USER nextjs
EXPOSE 3007
ENV PORT=3007
CMD ["node", "apps/web-payroll/server.js"]
