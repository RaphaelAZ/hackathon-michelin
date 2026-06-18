FROM node:22-alpine AS development

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
EXPOSE 80
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "80"]

# ---

FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---

FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/dist/hackathon-michelin/browser /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
