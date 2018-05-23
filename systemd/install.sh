#!/usr/bin/env bash

# NOTE: run as superuser
cp -rf *.service /etc/systemd/system/

systemctl enable api
systemctl enable master
systemctl enable smartd
systemctl enable statsd

systemctl daemon-reaload