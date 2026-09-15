# syntax=docker/dockerfile:1
#
# Build context is the MONOREPO ROOT (needed so npm workspaces can resolve
# @mseezee/shared) — build with:
#   docker build -f apps/web/Dockerfile -t mseezee-web .
# from the repo root, not from apps/web.
#
# Deliberately NOT using Next's `output: standalone` pruning — this keeps the
# full node_modules (including the Prisma CLI) in the runtime image, which
# makes `prisma migrate deploy` on container start trivial. Costs some image
# size; buys a lot of operational simplicity, which is the right trade at this
# scale (single small VPS, not a fleet).

FROM node:20-slim AS base
WORKDIR /repo

# ---- deps: install once, cached unless a package.json changes ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
# --ignore-scripts: apps/web's postinstall runs `prisma generate`, which needs
# prisma/schema.prisma — not copied into this layer on purpose, so this stage
# stays cached across source changes. The build stage below runs
# `prisma generate` explicitly (via apps/web's own build script) once the
# full source is present.
RUN npm ci --ignore-scripts

# ---- build: generate the Prisma client, typecheck shared, build Next.js ----
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build --workspace @mseezee/web

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=build /repo ./
RUN chown -R nextjs:nodejs /repo
USER nextjs
WORKDIR /repo/apps/web

EXPOSE 3000
# Applies any new migrations, then starts the server — one image, no separate
# migration step to remember. `migrate deploy` is safe to run on every boot:
# it only applies migrations that haven't run yet. Respects $PORT so the
# host-networked container can be moved off 3000 if that's already taken.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p ${PORT:-3000}"]
