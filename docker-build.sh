#!/usr/bin/env bash
sudo docker build --no-cache -t mcps/atlante -f atlante.dockerfile database
sudo docker build --no-cache -t mcps/api -f api.dockerfile .