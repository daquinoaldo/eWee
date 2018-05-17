#!/usr/bin/env bash
cd network/raspberry-pi
npm install
sudo nohup node master.js 2>1 &
cd ../../database
npm install
cd ../api
npm install
nohup node api.js 2>1 &