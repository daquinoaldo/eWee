#!/usr/bin/env bash
sudo docker build --no-cache -t mcps/atlante database
sudo docker build --no-cache -t mcps/api .