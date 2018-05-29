#!/usr/bin/env bash
#API
sudo docker build --no-cache -t mcps/api -f api.dockerfile .

#Smartness
sudo docker build --no-cache -t mcps/smartness smartness

#UI
sudo docker build --no-cache -t mcps/ui ui/ESTIA

#DEMO
# You should not run this, is just for testing
sudo docker build --no-cache -t mcps/bigsensorgen -f demo/bigsensorgen.dockerfile demo
sudo docker build --no-cache -t mcps/sensorgen -f demo/sensorgen.dockerfile demo