# This file describes how to build slack-pokemon into a runnable linux container with
# all dependencies installed.

# Set the base image to Ubuntu
FROM        ubuntu

# Update
run apt-get -y update

# Install node and npm
###run apt-get -y install nodejs npm
run apt-get -y install nodejs-legacy npm


### Currently going to use supervisord to run everything in a single container
# Also install redis locally
run apt-get -y install redis-server
run apt-get -y install supervisor

add ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Define working directory
WORKDIR /src
# Copy current directory into container
ADD . /src

# Get node_modules
run npm install

# Expose slack-pokemon's port (no need to expose redis)
EXPOSE 5000

# Start supervisor
cmd ["supervisord", "-n"]
