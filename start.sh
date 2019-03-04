#!/bin/bash

cd server
nohup npm run start-prod > ../../log/server-$(date +%Y%m%d-%H%M%S).log 2> ../../log/server-error-$(date +%Y%m%d-%H%M%S).log < /dev/zero &
