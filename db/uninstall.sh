# Stop the service
sudo service mongod stop
# Remove package
sudo apt-get purge mongodb-org*
# Remove databases and log files
sudo rm -r /var/log/mongodb
sudo rm -r /var/lib/mongodb