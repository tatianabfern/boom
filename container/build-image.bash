#!/usr/bin/env bash

# This script is here for ease of understanding container implementation
sudo docker build -t boom:latest . || exit 1
sudo docker save boom:latest -o boom-image.tar || exit 1

echo Load image with \`docker load -i boom-image.tar\`

