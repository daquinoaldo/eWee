#!/usr/bin/env bash
# NOTE: run as superuser
cp -rf sensorgen.service /etc/systemd/system
systemctl enable sensorgen
systemctl daemon-reload
