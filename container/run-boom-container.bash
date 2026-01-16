#!/usr/bin/env bash

image=ghcr.io/vision940/boom:latest

if [[ "$1" == "local" ]]; then
  image=boom-test-container:local
fi

sudo docker run --name boom-dev --rm -it -p 5252:5252 $image

#TODOs here:
# - add variable number of users with randomly generated amounts of booms - maybe a script for when in the container already
# - maybe add systemctl and run the zone service by default on container start
# - optionally save data to a local dir in container/
# - keep an eye out for missing packages or bugs in a container install
# - add getopts and don't do anything but show -h when run with no options
# - handle non-docker container handlers?

