#!/bin/bash

npx prisma migrate dev
npx prisma generate
node dist/server.js