#!/bin/bash

systemctl stop updater.timer
systemctl disable updater.timer

rm -f /etc/systemd/system/updater.{timer,service}

systemctl daemon-reload
