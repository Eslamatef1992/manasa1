#!/usr/bin/env bash
# Run on the server after pushing to GitHub:  cd /var/www/manasa && ./deploy.sh
set -e
cd "$(dirname "$0")"

NODE_DIR=/opt/node22
if [ ! -x "$NODE_DIR/bin/node" ]; then echo "Node 22 not found in $NODE_DIR"; exit 1; fi

git pull --ff-only
[ -f .env ] || { cp .env.example .env; sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env; echo "Created .env — edit SMTP and admin password, then run ./deploy.sh again"; exit 0; }

# install + build with Node 22 only (system node untouched)
( export PATH="$NODE_DIR/bin:$PATH"; npm ci && npm run build && npm prune --omit=dev )
mkdir -p data uploads

if pm2 describe manasa >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save
pm2 status manasa
