#!/bin/bash

find . -type d -name "node_modules" -exec rm -r {} +

find ./packages -maxdepth 1 -type d -not -path "./packages" -not -path "./packages/sandbox" -print0 | while IFS= read -r -d $'\0' dir; do
  pushd "$dir" > /dev/null
  echo "Updating package in: $dir"
  bun update
  popd > /dev/null
done