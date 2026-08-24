# Builds apps/docs — the component documentation site for @gryt/ui — and serves
# the static output from nginx. The build context is the workspace root, not
# apps/docs, because the docs app resolves @gryt/ui straight from
# packages/ui/src rather than from a published tarball.
#
# Debian rather than alpine on purpose: Tailwind v4 and lightningcss both ship
# native binaries, and picking the musl variants out of a lockfile resolved on
# macOS is a fight with no upside here. The runtime image is alpine.
FROM --platform=$BUILDPLATFORM oven/bun:1.2 AS builder

WORKDIR /app

# Manifests first so a source-only change doesn't reinstall the world.
#
# Every workspace member has to be listed. bun.lock describes all of them, and
# --frozen-lockfile fails outright on a manifest it cannot find rather than
# skipping that member: ui-native was added without this line and the image
# stopped building with "lockfile had changes, but lockfile is frozen", which
# reads like a stale lockfile and is not one. Adding a package under packages/
# or apps/ means adding it here too.
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/theme/package.json ./packages/theme/
COPY packages/owl/package.json ./packages/owl/
COPY packages/ui/package.json ./packages/ui/
COPY packages/ui-native/package.json ./packages/ui-native/
COPY apps/docs/package.json ./apps/docs/
RUN bun install --frozen-lockfile

COPY . .
RUN bun --filter @gryt/docs build

FROM nginx:alpine

RUN printf '%s\n' \
  'events { worker_connections 1024; }' \
  'http {' \
  '  include /etc/nginx/mime.types;' \
  '  default_type application/octet-stream;' \
  '  sendfile on;' \
  '  keepalive_timeout 65;' \
  '  gzip on;' \
  '  gzip_types text/css application/javascript application/json image/svg+xml;' \
  '  server {' \
  '    listen 80;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '    # Relative 301s, same reason as packages/site: nginx otherwise builds the' \
  '    # Location header from its own listen directive and hands out an http://' \
  '    # redirect on an https site.' \
  '    absolute_redirect off;' \
  '    # Hashed filenames, so these can never go stale.' \
  '    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; try_files $uri =404; }' \
  '    # $uri/index.html rather than $uri/: scripts/prerender.ts writes a real' \
  '    # directory per route so each page can carry its own og:image, and a bare' \
  '    # $uri/ makes nginx 301 to add the trailing slash. Serving the file' \
  '    # directly saves every crawler and visitor that redirect.' \
  '    #' \
  '    # =404 rather than a fallback to /index.html. Every route in' \
  '    # apps/docs/src/routes.ts is written to disk, so a path that does not' \
  '    # resolve is a path that does not exist. Falling back meant any typo' \
  '    # answered 200 and rendered React Router 404 on top of front-page' \
  '    # metadata: a status check called a missing page fine, and crawlers' \
  '    # indexed it as a duplicate of the home page. Same fix as packages/site.' \
  '    location / { try_files $uri $uri/index.html =404; }' \
  '    location = /index.html { add_header Cache-Control "no-cache"; }' \
  '    # The SPA boots from this exactly as it does from any other entry point,' \
  '    # and the catch-all route renders NotFound — with a real 404 status' \
  '    # under it this time.' \
  '    error_page 404 /404.html;' \
  '    location = /404.html { internal; }' \
  '    location /health { return 200 "healthy"; add_header Content-Type text/plain; }' \
  '  }' \
  '}' > /etc/nginx/nginx.conf

COPY --from=builder /app/apps/docs/dist /usr/share/nginx/html

EXPOSE 80

# 127.0.0.1, not localhost: localhost resolves to ::1 first here and nginx is
# listening on IPv4, so the probe is refused every time.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
