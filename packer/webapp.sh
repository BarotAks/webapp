#!/bin/bash

# Exit immediately if any command exits with a non-zero status (error)
set -e

# Disable SELinux temporarily
echo "Disabling SELinux temporarily"
sudo setenforce 0

# Update the system packages
echo "Updating the system"
sudo yum update -y
sudo yum upgrade -y

# Install Node.js and npm
echo "Installing Node.js"
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Install unzip utility if not already installed
echo "Installing unzip"
sudo yum install -y unzip

# # Install application dependencies
# echo "Installing mariadb-server"
# sudo yum install -y mariadb-server 

# Create csye6225 group if it doesn't exist
echo "Creating csye6225 group"
sudo groupadd -r csye6225 || true

# Set up csye6225 user
echo "Setting up csye6225 user"
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225 || true

# Modify the csye6225 user's shell to /usr/sbin/nologin
echo "Modifying csye6225 user's shell"
sudo usermod --shell /usr/sbin/nologin csye6225 || true

# # Create directory for the application
# echo "Creating directory for the application"
# sudo mkdir -p /opt/application

# # Copy application artifact using file provisioner
# echo "Copying application artifact"
# sudo cp /home/csye6225/webapp.zip /opt/application/

# Unzip the webapp artifact
echo "Unzipping the application artifact"
sudo unzip /home/csye6225/webapp.zip -d /home/csye6225/webapp

# Set ownership for the application files
echo "Setting ownership for the application files"
sudo chown -R csye6225:csye6225 /home/csye6225/webapp

# # Create MySQL database and user
# echo "Creating MySQL database and user"
# sudo systemctl start mariadb
# sudo systemctl enable mariadb
# # sudo mysql -u root -proot -e 'CREATE DATABASE webapp;'
# # sudo mysql -u root -proot -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';"
# # sudo mysql -u root -proot -e "GRANT ALL PRIVILEGES ON webapp.* TO 'root'@'localhost' IDENTIFIED BY 'root';"
# # sudo mysql -u root -proot -e "FLUSH PRIVILEGES;"
# # sudo mysql -e "CREATE DATABASE IF NOT EXISTS webapp;"
# # sudo mysql -e "CREATE USER IF NOT EXISTS'root'@'localhost' IDENTIFIED BY 'root';"
# # sudo mysql -e "GRANT ALL PRIVILEGES ON webapp.* TO 'root'@'localhost';"
# # sudo mysql -e "FLUSH PRIVILEGES;"

# # Wait for MariaDB to start (optional, depending on system speed)
# sleep 10

# # Set up root password for MySQL (if not already set)
# sudo mysqladmin -u root password "root" || true

# # Create database and user with appropriate privileges
# sudo mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS webapp;"
# sudo mysql -u root -proot -e "CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'root';"
# sudo mysql -u root -proot -e "GRANT ALL PRIVILEGES ON webapp.* TO 'root'@'localhost';"
# sudo mysql -u root -proot -e "FLUSH PRIVILEGES;"

# Navigate to the webapp directory and install node modules
echo "Installing node modules"
cd /home/csye6225/webapp
sudo npm install
sudo npm install mysql2@2.2.5
sudo touch .env
sudo chmod 777 .env

# echo "DB_HOST=localhost" >> .env
# echo "DB_USER=root" >> .env
# echo "DB_PASSWORD=root" >> .env
# echo "DB_NAME=webapp" >> .env

# # Copy the Ops Agent configuration file to the appropriate location
# echo "Copying Ops Agent configuration"
# sudo cp /tmp/ops-agent-config.yaml /etc/google-cloud-ops-agent/config.yaml
        
# Download and install the Ops Agent package
echo "Installing and configuring Ops Agent"
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
sudo yum install -y google-cloud-ops-agent

# Copy the Ops Agent configuration file to the appropriate location
echo "Copying Ops Agent configuration"
sudo cp /tmp/ops-agent-config.yaml /etc/google-cloud-ops-agent/config.yaml
        
# Start the Ops Agent
echo "Starting Ops Agent"
sudo systemctl start google-cloud-ops-agent
        
# Enable the Ops Agent to start on boot
echo "Enabling Ops Agent to start on boot"        
sudo systemctl enable google-cloud-ops-agent

# Copy the systemd service file and start the service
echo "Setting up and starting the webapp service"
sudo cp /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl daemon-reload
sudo systemctl start webapp.service
sudo systemctl enable webapp.service

echo "Script executed successfully!"