#!/usr/bin/env bash
sudo docker build --no-cache -t mcps/atlante atlante.dockerfile
sudo docker build --no-cache -t mcps/api api.dockerfile