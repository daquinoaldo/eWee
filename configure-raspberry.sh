#!/usr/bin/env bash
sudo bash systemd/install.sh
cd api
npm install
#TODO after refactoring
sudo reboot