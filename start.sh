#!/bin/bash

cd server
nohup npm run start-prod > ../../log/server.log 2> ../../log/server-error.log < /dev/zero &
