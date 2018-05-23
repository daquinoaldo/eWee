#!/usr/bin/env bash

# NOTE: run as superuser
cp *.service /etc/systemd/system/

systemctl enable api
systemctl enable master
system enable smartd

systemctl daemon-reaload