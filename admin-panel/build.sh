#!/bin/sh
# Replace placeholder with actual Railway backend URL
if [ -n "$API_URL" ]; then
  echo "Setting API URL to: $API_URL"
  sed -i "s|https://sharez-backend.up.railway.app/api|$API_URL|g" \
    src/environments/environment.prod.ts
fi
npm run build -- --configuration production
