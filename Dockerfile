# CENA API — deployed from the monorepo root so pnpm workspace resolution
# (packages/shared) works. Runs the API via tsx directly (no separate compile
# step), matching local dev exactly.
FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3333
CMD ["pnpm", "start"]
