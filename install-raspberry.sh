#!/usr/bin/env bash
# Update & upgrade
sudo apt-get update
sudo apt-get upgrade -y
# Install git and MongoDB
sudo apt-get install -y git mongodb
# Install NodeJS from binary (for RPi < 2B+)
mkdir temp-download
cd temp-download
wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.xz
tar -xvf node-v8.9.0-linux-armv6l.tar.xz
cd node-v8.9.0-linux-armv6l/
sudo cp -R * /usr/local/
cd
rm -rf temp-download
# Clone the repository
git clone https://github.com/daquinoaldo/MCPS.git