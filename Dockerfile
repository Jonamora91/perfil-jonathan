# --- build stage: generate the static site from data/cv.json ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY data ./data
COPY src ./src
COPY build.mjs ./
ARG SITE_ORIGIN=https://perfil-jonathan.morochoa.com
ENV SITE_ORIGIN=$SITE_ORIGIN
RUN node build.mjs

# --- serve stage: nginx serving the generated dist/ ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
