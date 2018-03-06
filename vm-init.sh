#!/bin/sh
set -x
echo "post-installation started..."
sudo rm -f /var/lib/dpkg/lock
sudo apt-get update
sudo apt-get install docker.io -y -f
sudo usermod -aG docker ubuntu
sudo echo 'DOCKER_OPTS="-H tcp://localhost:2375 -H unix:///var/run/docker.sock --insecure-registry 115.146.95.30:5000"' >> /etc/default/docker
sudo openssl s_client -showcerts -connect docker.eresearch.unimelb.edu.au:443 < /dev/null 2> /dev/null | openssl x509 -outform PEM > eresearch.crt
sudo cp eresearch.crt /usr/local/share/ca-certificates
sudo update-ca-certificates
sudo service docker stop
sudo service docker start
sudo sed -i 's/.*127.0.1.1/#&/' /etc/hosts
sudo sysctl vm.swappiness=5
sudo swapoff -a
sudo swapon -a

sudo apt-get install haproxy -y
HAPCFG=/etc/haproxy/haproxy.cfg
echo 'userlist UsersFor_Ops' | sudo tee --append ${HAPCFG}
# mkpasswd -m sha-512 z2XZsxuSsF93XV3DfmD7t2DUn3SvFeREbFzqKTbtq7vKJSLQzJNVfSTHxWNH8emTPEnmRr36mJYz7UpmYa8D6jsYMCwUSB8pugvV6jHU3PDqbXjKGFJjenzedDEgWv8x
echo '   user docker password $6$gpEYSWZokJ.hNKnK$dfInh49wHOWIj/lKT7W0OfPbCTbfs6BQ/bc8msy9Mtd3rSfrHkhW0qhYQRMLsCIA0ZVuQXMjejnqWOAxSBbdo/'  | sudo tee --append ${HAPCFG}
echo 'frontend http' | sudo tee --append ${HAPCFG}
echo '   bind 0.0.0.0:3375' | sudo tee --append ${HAPCFG}
echo '   use_backend docker' | sudo tee --append ${HAPCFG}
echo '   acl AuthOkay_Ops http_auth(UsersFor_Ops)'  | sudo tee --append ${HAPCFG}
echo '   http-request auth realm Ops if !AuthOkay_Ops'  | sudo tee --append ${HAPCFG}
echo 'backend docker' | sudo tee --append ${HAPCFG}
echo '   server localhost localhost:2375'  | sudo tee --append ${HAPCFG}

sudo service haproxy restart

echo "post-installation done"

## tmp
#sudo su
#sudo echo 'DOCKER_OPTS="-H tcp://localhost:2375 -H unix:///var/run/docker.sock --insecure-registry 115.146.95.30:5000"' >> /etc/default/docker && \
#sudo service docker restart && \
#sudo apt-get install haproxy -y && \
#HAPCFG=/etc/haproxy/haproxy.cfg && \
#echo 'userlist UsersFor_Ops' | sudo tee --append ${HAPCFG} && \
#echo '   user docker password $6$gpEYSWZokJ.hNKnK$dfInh49wHOWIj/lKT7W0OfPbCTbfs6BQ/bc8msy9Mtd3rSfrHkhW0qhYQRMLsCIA0ZVuQXMjejnqWOAxSBbdo/'  | sudo tee --append ${HAPCFG} && \
#echo 'frontend http' | sudo tee --append ${HAPCFG} && \
#echo '   bind 0.0.0.0:3375' | sudo tee --append ${HAPCFG} && \
#echo '   use_backend docker' | sudo tee --append ${HAPCFG} && \
#echo '   acl AuthOkay_Ops http_auth(UsersFor_Ops)'  | sudo tee --append ${HAPCFG} && \
#echo '   http-request auth realm Ops if !AuthOkay_Ops'  | sudo tee --append ${HAPCFG} && \
#echo 'backend docker' | sudo tee --append ${HAPCFG} && \
#echo '   server localhost localhost:2375'  | sudo tee --append ${HAPCFG} && \
#sudo service haproxy restart