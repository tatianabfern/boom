#!/usr/bin/env bash

BOOMCONTS='sudo docker'
$BOOMCONTS run --name boom-dev --rm -it -p 5252:5252/tcp ghcr.io/vision940/boom:v2.8.21-c318018

