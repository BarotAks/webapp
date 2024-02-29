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
# sudo usermod -s /usr/sbin/nologin csye6225 || true

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
# sudo touch .env
# sudo chmod 777 .env

# Create .env file if it doesn't exist
echo "Creating .env file if it doesn't exist"
sudo touch /home/csye6225/webapp/.env

# Set permissions for .env file
sudo chmod 644 /home/csye6225/webapp/.env

# Set environment variables for database connection
echo "Setting environment variables for database connection"
echo "DB_HOST=${google_sql_database_instance.my_sql_instance.first_ip_address}" >> /home/csye6225/webapp/.env
echo "DB_USER=${google_sql_user.my_user.name}" >> /home/csye6225/webapp/.env
echo "DB_PASSWORD=${random_password.db_password.result}" >> /home/csye6225/webapp/.env
echo "DB_NAME=${google_sql_database.my_database.name}" >> /home/csye6225/webapp/.env

# echo "DB_HOST=localhost" >> .env
# echo "DB_USER=root" >> .env
# echo "DB_PASSWORD=root" >> .env
# echo "DB_NAME=webapp" >> .env

# Copy the systemd service file and start the service
echo "Setting up and starting the webapp service"
sudo cp /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl daemon-reload
sudo systemctl start webapp.service
sudo systemctl enable webapp.service

echo "Script executed successfully!"