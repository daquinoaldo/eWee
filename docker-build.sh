#!/usr/bin/env bash
#API
sudo docker build --no-cache -t ewee/api -f api.dockerfile .

#Smartness
sudo docker build --no-cache -t ewee/smartness smartness

#UI
sudo docker build --no-cache -t ewee/ui ui/ESTIA

#DEMO
# You should not run this, is just for testing
sudo docker build --no-cache -t ewee/bigsensorgen -f demo/bigsensorgen.dockerfile demo
sudo docker build --no-cache -t ewee/sensorgen -f demo/sensorgen.dockerfile demo