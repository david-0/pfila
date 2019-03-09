#!/bin/bash

s=$(readlink -f $0)
cd ${s%/*}
nohup npm start > ../log/server-$(date +%Y%m%d-%H%M%S).log 2> ../log/server-error-$(date +%Y%m%d-%H%M%S).log < /dev/zero &
