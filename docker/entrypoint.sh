#!/bin/sh

export npm_package_version=$(cat /app/VERSION.MD)
node /app/index.js "$@"