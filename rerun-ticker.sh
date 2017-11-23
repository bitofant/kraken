#!/bin/bash
docker stop kraken_ticker
docker rm kraken_ticker
docker-compose build
docker run -d -p 8070:8080 --name kraken_ticker kraken_ticker
