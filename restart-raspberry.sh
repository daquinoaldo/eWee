#!/usr/bin/env bash
git reset --hard
rm database/mongo/*
git pull
# This may be NOT a good idea...
sudo pkill -f sudo
sudo pkill -f node
bash start-raspberry.sh