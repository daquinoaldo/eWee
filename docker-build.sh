#!/usr/bin/env bash
#API
sudo docker build --no-cache -t mcps/api -f api.dockerfile .

#Smartness
sudo docker build --no-cache -t mcps/smartness smartness

#UI
cd ui
npm install
npm run build
cd ..
sudo docker build --no-cache -t mcps/ui ESTIA

#DEMO
sudo docker build --no-cache -t mcps/demo demo