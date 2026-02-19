FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/auth/package.json ./packages/auth/
COPY packages/monitoring/package.json ./packages/monitoring/
COPY apps/api-reg-monitor/package.json ./apps/api-reg-monitor/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api-reg-monitor/node_modules ./apps/api-reg-monitor/node_modules
COPY . .
RUN cd packages/database && pnpm install --no-frozen-lockfile && cd /app && pnpm --filter=@ims/database generate:all && pnpm --filter=@ims/database build
RUN pnpm --filter=@ims/types build
RUN pnpm --filter=@ims/auth build
RUN pnpm --filter=@ims/monitoring build
RUN pnpm --filter=@ims/api-reg-monitor build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules/.modules.yaml ./node_modules/.modules.yaml
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-reg-monitor/dist ./apps/api-reg-monitor/dist
COPY --from=builder /app/apps/api-reg-monitor/package.json ./apps/api-reg-monitor/
COPY --from=builder /app/apps/api-reg-monitor/node_modules ./apps/api-reg-monitor/node_modules
COPY apps/api-reg-monitor/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
WORKDIR /app/apps/api-reg-monitor
EXPOSE 4035
ENTRYPOINT ["/entrypoint.sh"]
