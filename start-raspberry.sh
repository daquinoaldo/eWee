#!/usr/bin/env bash
cd MCPS/network/raspberry-pi
npm install
git
cd ../../database
npm install
cd ../api
npm install
nohup node api.js 2>1 &