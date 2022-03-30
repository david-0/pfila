#!/bin/bash

server=davidl@88.99.118.38

s=$(readlink -f $0)
cd ${s%/*}

. ./common.sh

exec ssh $server << EOF
	~/website/pfila-int/deploy/deploy/prepare-for-client-upload.sh
EOF
if [[ "$1" = "--full" ]] || [[ "$2" = "--full" ]] ; then
	level="--full"
	exec rm -rf pfila
	exec git clone https://github.com/david-0/pfila.git
	exec cd pfila/client
	exec npm install
	exec npm run build-prod
	exec cd ../..
else
	exec cd pfila
	exec git reset --hard
	exec git clean -fd
	exec git pull
	exec cd client
	exec npm run build-prod
	exec cd ../..
fi;
exec scp -r pfila/client/dist $server:~/website/pfila-int/prebuilt-client
exec ssh $server << EOF
	~/website/pfila-int/deploy/deploy/deploy.sh $level --use-prebuilt-client
EOF
