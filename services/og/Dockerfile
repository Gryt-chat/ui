# Link previews that show the shared card (GRYT-1673): server.mjs plus the Chromium it drives.
# Debian for Chromium's arm64 package; nothing from npm, so there's no lockfile to keep in step.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium fonts-noto-color-emoji fonts-dejavu-core ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home og && mkdir /cache && chown og /cache
USER og
WORKDIR /srv
COPY --chown=og server.mjs ./

ENV PORT=8080 CACHE_DIR=/cache CHROMIUM=/usr/bin/chromium
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

CMD ["node", "server.mjs"]
