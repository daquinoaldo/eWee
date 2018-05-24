#!/bin/bash

cp -rf updater.{timer,service} /etc/systemd/system

systemctl daemon-reload
systemctl enable updater.timer
systemctl start updater.timer
