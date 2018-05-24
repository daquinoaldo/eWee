#!/usr/bin/env bash
sudo docker build --no-cache -t mcps/api -f api.dockerfile .
sudo docker build --no-cache -t mcps/ui ui