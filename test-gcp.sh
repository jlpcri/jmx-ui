#!/bin/sh
export CHROME_BIN=/usr/bin/chromium-browser
apk update && apk add --no-cache npm chromium && npm run test-gcp
