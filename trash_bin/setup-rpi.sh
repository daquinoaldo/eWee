#!/usr/bin/env bash
# Add NodeJS repository
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
# Update package and upgrade
sudo apt-get update
sudo apt-get dist-upgrade
# Install NodeJS and git
sudo apt-get install -y nodejs git mongodb                                       