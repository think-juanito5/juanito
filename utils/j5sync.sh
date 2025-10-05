#!/bin/bash

# Sync script: takes source and target as input arguments
# Usage: ./j5sync.sh <source_dir> <target_dir>
# Example 1: ./utils/j5sync.sh ~/DBC/dbctech-v3/cca.integration.services/monorepo/packages/ ~/DBC/dbctech-v3/dbc.johnny5/monorepo/packages/
# Example 2: ./utils/j5sync.sh /home/neil/code/dbc/cca.integration.services/monorepo/packages/ /home/neil/code/dbc/dbc.johnny5/monorepo/packages/
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <source_dir> <target_dir>"
  exit 1
fi

SOURCE="$1"
TARGET="$2"

rsync -av --delete \
  --exclude=node_modules \
  --exclude=webhook-functions-inputs \
  --exclude=webhook-functions-processing \
  --exclude=azure-functions \
  --exclude=handlers \
  --exclude=services \
  --exclude=sandbox \
  --exclude=*.log \
  --exclude='johnny5/dapr/constants.ts' \
  --exclude=http2 \
  --exclude=johnny5-sdk \
  --exclude=app \
  --exclude=postgres-data \
  "$SOURCE" "$TARGET"
