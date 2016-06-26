#!/bin/sh
set -x
echo "post-installation started..."
sudo rm -f /var/lib/dpkg/lock
sudo apt-get update
sudo apt-get install docker.io -y -f
sudo usermod -aG docker ubuntu
sudo echo 'DOCKER_OPTS="-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock --insecure-registry 115.146.95.30:5000"' >> /etc/default/docker
sudo openssl s_client -showcerts -connect docker.eresearch.unimelb.edu.au:443 < /dev/null 2> /dev/null | openssl x509 -outform PEM > eresearch.crt
sudo cp eresearch.crt /usr/local/share/ca-certificates
sudo update-ca-certificates
sudo service docker stop
sudo service docker start
sudo sed -i 's/.*127.0.1.1/#&/' /etc/hosts
sudo sysctl vm.swappiness=5
sudo swapoff -a
sudo swapon -a
echo "post-installation done"