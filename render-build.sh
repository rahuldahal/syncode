#!/bin/bash

set -e

# Install dependencies
yarn install --frozen-lockfile

# Check if schema.prisma has changed
if [ -f .schema_prisma_last_modified ]; then
  if [ prisma/schema.prisma -nt .schema_prisma_last_modified ]; then
    SCHEMA_CHANGED=true
  else
    SCHEMA_CHANGED=false
  fi
else
  SCHEMA_CHANGED=true
fi

if [ "$SCHEMA_CHANGED" = true ]; then
  echo "schema.prisma has changed. Running Prisma commands."
  
  # Generate Prisma client
  npx prisma generate

  # Create and apply Prisma migrations
  npx prisma migrate dev --name auto-migration --preview-feature
  npx prisma migrate deploy --preview-feature

  # Update the last modified timestamp file
  touch .schema_prisma_last_modified
else
  echo "schema.prisma has not changed. Skipping Prisma commands."
fi

# Build the application
yarn build