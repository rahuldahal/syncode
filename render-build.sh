#!/bin/bash

set -e

# Check if schema.prisma has changed
if git diff --exit-code HEAD~1 -- prisma/schema.prisma; then
  echo "schema.prisma has not changed. Skipping Prisma commands."
else
  echo "schema.prisma has changed. Running Prisma commands."
  
  # Generate Prisma client
  npx prisma generate
  
  # Create and apply Prisma migrations
  npx prisma migrate dev --name auto-migration
  npx prisma migrate deploy
fi

yarn install --frozen-lockfile

yarn build
