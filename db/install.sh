# Add the apt-key
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
# Add the repo to the apt sources
echo "deb http://repo.mongodb.org/apt/debian $(lsb_release -cs)/mongodb-org/3.6 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
# Update the package list                   
sudo apt-get update
# Install the latest release
sudo apt-get install -y mongodb-org
# Done.