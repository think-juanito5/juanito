#!/bin/bash

# Sync script: takes source and target as input arguments
# Usage: ./j5sync-full.sh <source_dir> <target_dir>
# Example 1: ./j5sync-full.sh ~/DBC/dbctech-v3/cca.integration.services/ ~/DBC/dbctech-v3/dbc.johnny5/
# Example 2: ./j5sync-full.sh /home/neil/code/dbc/cca.integration.services/ /home/neil/code/dbc/dbc.johnny5/
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <source_dir> <target_dir>"
  exit 1
fi

SOURCE="$1"
TARGET="$2"

rsync -av --delete \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=.idea \
  --exclude=webhook-functions-inputs \
  --exclude=webhook-functions-processing \
  --exclude=azure-functions \
  --exclude=handlers \
  --exclude=services \
  --exclude=sandbox \
  --exclude=*.log \
  --exclude='johnny5/dapr/constants.ts' \
  --exclude=/.github \
  --exclude='/__blobstorage_' \
  --exclude='/__queuestorage_' \
  --exclude='__azurite_*' \
  --exclude=/apps \
  --exclude=/bicep \
  --exclude=/docs \
  --exclude=/powerapps \
  --exclude=/test \
  --exclude=/utils \
  --exclude='/monorepo/packages/http2' \
  --exclude='/monorepo/packages/johnny5-sdk' \
  --exclude='app' \
  --exclude=postgres-data \
  --exclude=/monorepo/bun.lock \
  "$SOURCE" "$TARGET"
