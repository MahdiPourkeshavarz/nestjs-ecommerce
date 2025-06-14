# ---- Stage 1: Build the application ----
FROM node:20-alpine AS builder


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build

# ---- Stage 2: Create the final production image ----
FROM node:20-alpine AS runner

WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install --omit=dev


COPY --from=builder /usr/src/app/dist ./dist


COPY --from=builder /usr/src/app/public ./public


EXPOSE 8000


CMD ["node", "dist/main.js"]