# Backend NOC — build a partir da raiz do repo (Railway sem Root Directory)
FROM node:22-alpine AS builder

WORKDIR /app

COPY back/package.json back/package-lock.json ./
RUN npm ci

COPY back/tsconfig.json ./
COPY back/src ./src
RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
COPY back/package.json back/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
