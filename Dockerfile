# ── NutriScan AI · Frontend (React + Vite, disajikan nginx) ──────────────────
# Build arg VITE_API_BASE = URL backend Cloud Run (disuntik saat build).
FROM node:20-alpine AS build
WORKDIR /app

# Instal dependensi (cache layer).
COPY package*.json ./
RUN npm install

# Build dengan URL API backend.
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE
COPY . .
RUN npm run build

# ── Tahap penyajian ──
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
