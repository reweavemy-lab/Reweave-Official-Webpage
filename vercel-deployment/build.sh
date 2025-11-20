#!/bin/bash
# Simple build script for static deployment
mkdir -p dist
cp index.html dist/
cp -r images dist/ 2>/dev/null || true
echo 'Static files copied to dist folder'