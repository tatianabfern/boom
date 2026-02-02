#!/usr/bin/env bash

image=ghcr.io/vision940/boom:latest

if [[ "$1" == "local" ]]; then
  image=boom-test-container:local
fi

sudo docker run --name boom-dev --rm -itd -p 5252:5252 $image || exit 1

echo Waiting for server startup
while ! sudo docker exec boom-dev curl localhost:5252 &>/dev/null; do
  sleep 1
done
echo -e "Server started\n"

for user in boom-dev; do
  sudo docker exec -it -u $user boom-dev bash -cl "exit" # Source boomrc to establish site login
done

echo Container started
echo "    Remove with: sudo docker rm -f boom-dev"
echo "     Enter with: sudo docker exec -it boom-dev bash"
echo "       Site URL: http://localhost:5252"

#TODOs here:
# - add variable number of users with randomly generated amounts of booms - maybe a script for when in the container already
# - maybe add systemctl and run the zone service by default on container start
# - optionally save data to a local dir in container/
# - keep an eye out for missing packages or bugs in a container install
# - add getopts and don't do anything but show -h when run with no options
# - handle non-docker container handlers?

