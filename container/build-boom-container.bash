#!/usr/bin/env bash

GIT_TL=$(git rev-parse --show-toplevel)
pushd $GIT_TL || { echo ERROR: Could not pushd to top level $GIT_TL; exit 1; }

# Simple script to build container for local testing
sudo docker buildx create --name boom-builder --use
sudo docker buildx inspect --bootstrap

sudo docker buildx build --load \
  -f ./container/Dockerfile \
  -t boom-test-container:local \
  .

popd

