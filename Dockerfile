FROM node:24-bookworm AS base

WORKDIR /app/ts/base

RUN apt -y update && apt install -y --no-install-recommends \
  build-essential clang libdbus-1-dev libgtk-3-dev \
  libnotify-dev libasound2-dev libcap-dev \
  libcups2-dev libxtst-dev \
  libxss1 libnss3-dev gcc-multilib g++-multilib curl \
  gperf bison python3-dbusmock

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY tsconfig.json .
COPY tsconfig.node.json .
COPY tsconfig.web.json .

RUN corepack enable && pnpm install --frozen-lockfile
COPY . .

FROM node:24-bookworm AS builder

ENV NODE_ENV=production
WORKDIR /app/ts/builder

COPY --from=base /app/ts/base /app/ts/builder
RUN corepack enable && pnpm build

FROM nginx:latest AS production

WORKDIR /app/ts/src

COPY --from=builder /app/ts/builder/out/renderer /usr/share/nginx/html

EXPOSE 80
