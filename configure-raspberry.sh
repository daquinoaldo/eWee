#!/usr/bin/env bash
# Install systemds for the services
sudo bash systemd/install.sh
sudo bash updater/enable-updater.sh
#sudo bash demo/install.sh  # you should not install thi service, it generates fake data for testing
# Install all dependencies
cd api
npm install
cd ../network/raspberry-pi
npm install
cd ../../ui
npm install
# Build the UI statics file
npm run build
cd ..
# Restart to activates the services
sudo reboot