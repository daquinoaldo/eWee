#!/usr/bin/env bash
#API
sudo docker build --no-cache -t mcps/api -f api.dockerfile .

#Smartness
sudo docker build --no-cache -t mcps/smartness smartness

#UI
sudo docker build --no-cache -t mcps/ui ui

#DEMO
sudo docker build --no-cache -t mcps/demo demo