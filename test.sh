#!/bin/bash

# Reset the database so user tests pass
docker rm -vf martletplace_database
docker compose up --build -d

echo 'Testing backend services...'
# NOTE: can't test lib like this, it would need to have its own server (cypress moment)
# docker compose exec user bash -c 'cd ../lib && npm install && npm run test:ci'
docker compose exec user npm run test:ci
docker compose exec listing npm run test:ci
docker compose exec review npm run test:ci
docker compose exec message npm run test:ci

echo 'Testing algorithm services...'
docker compose exec search pytest
docker compose exec recommend pytest

docker compose down
