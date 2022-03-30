#!/bin/bash

if [[ "$1" == "-h" ]]; then
	echo "usage: $0 [--full] [--use-prebuilt-client]"
	echo "the script must be run in specific location to deply int or prod";
	exit 1;
fi;

s=$(readlink -f $0)
cd ${s%/*}

. ./common.sh

# parameter 1: systemdServiceName
updateDbSettings() {
	if [[ "$1" = "pfila-int" ]]; then
		echo -n "update ormconfig for integration ..."
		sed -i 's/"database": "pfila"/"database": "pfila-int"/g' ormconfig.json
		processExitStatus
	fi;
}

if [[ "$(pwd)" = "/home/alixon/usr/davidl/website/pfila-prod/pfila-deploy" ]] ; then
	systemdServiceName=pfila-prod;
fi;
if [[ "$(pwd)" = "/home/alixon/usr/davidl/website/pfila-int/pfila-deploy" ]] ; then
	systemdServiceName=pfila-int;
fi;
if [[ "$1" = "--full" ]] || [[ "$2" = "--full" ]] ; then
	level=full;
fi;
if [[ "$1" = "--use-prebuilt-client" ]] || [[ "$2" = "--use-prebuilt-client" ]] ; then
	echo "use prebuilt client"
	usePrebuiltClient=yes;
fi;
if [[ "$systemdServiceName" = "" ]]; then
	echo "no service found";
	exit 1
fi;
export NG_CLI_ANALYTICS=false
cd ..
if [[ "$level" = "full" ]] || [[ ! -d "pfila-client" ]] ; then
	exec rm -rf pfila
	exec git clone https://github.com/david-0/pfila.git
	exec cd pfila/server
	updateDbSettings ${systemdServiceName}
	exec npm install
	exec npm run build
	exec cd ..

	if [[ "${usePrebuiltClient}" = "yes" ]]; then
		exec rm -rf server/dist/client
		exec mv ../prebuilt-client server/dist/client
	else
		exec cd client
		exec npm install
		exec npm run build-prod
		exec npm run deploy
		exec cd ..
	fi;
	exec cd ..
	
	exec sudo systemctl stop ${systemdServiceName}
	exec rm -rf pfila-run
	exec mv pfila-server pfila-run
	exec sudo systemctl start ${systemdServiceName}
else 
	exec sudo systemctl stop ${systemdServiceName}
	exec cd pfila-run
	exec git reset --hard
	exec git clean -fd
	exec git pull
	exec cd server
	updateDbSettings ${systemdServiceName}
	exec rm -rf dist
	exec npm run build
	exec cd ..
	
	if [[ "${usePrebuiltClient}" = "yes" ]]; then
		exec rm -rf pfila/server/dist/client
		exec mv ../prebuilt-client server/dist/client
	else
		exec cd client
		exec npm run build-prod
		exec npm run deploy
		exec cd ..
	fi;
	exec sudo systemctl start ${systemdServiceName}
fi;
