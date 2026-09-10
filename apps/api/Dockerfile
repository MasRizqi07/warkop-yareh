# Base node image
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Installer stage
FROM base AS installer
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy lockfile and package configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm --filter @warkop-yareh/database db:generate

# Build the shared database runtime package
RUN pnpm --filter @warkop-yareh/database build

# Build API application
RUN pnpm --filter @warkop-yareh/api build

# Create an isolated production bundle for the API workspace
RUN pnpm --filter @warkop-yareh/api deploy --prod /prod/api

# pnpm deploy does not copy Prisma's generated virtual-store artifact.
# Place it beside the deployed @prisma/client package, where Node resolves it.
RUN set -eu; \
    prisma_client_source="$(find /app/node_modules/.pnpm -path '*/node_modules/.prisma/client' -type d -print -quit)"; \
    prisma_client_package="$(find /prod/api/node_modules/.pnpm -path '*/node_modules/@prisma/client' -type d -print -quit)"; \
    test -n "$prisma_client_source"; \
    test -n "$prisma_client_package"; \
    prisma_client_target="$(dirname "$(dirname "$prisma_client_package")")/.prisma/client"; \
    mkdir -p "$prisma_client_target"; \
    cp -R "$prisma_client_source"/. "$prisma_client_target"/

# Production runner stage
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=4000

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy the portable API bundle and its production dependencies
COPY --from=installer --chown=nestjs:nodejs /prod/api ./

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main.js"]
