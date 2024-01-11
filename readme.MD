# installation
## BUILD
docker-compose build
## startup
docker-compose up -d


# Installation vom Hetzner Server
## Create Cloud VM
Type: CX21
SSH-Keys: public Key vom Notebook
Name: ubuntu-pfila2024
## Login 
ssh root@<IPV4>
### Package installation
apt update
apt dist-upgrade
apt install docker git docker-compose
### register ssh-key on github
ssh-keygen --> erstellt .ssh/id_rsa.pub und .ssh/id_rsa
login to github
- account 
-> settings
-> SSH und GPG keys
-> "New SSH key"
  -> Title: ubuntu-pfila2024-hetzner
  -> Inhalt vom PublicKey vom ubuntu-pfila2024 einfügen (cat root@<ubuntu-pfila2024>:~/.ssh/id_rsa.pub)
### git clone
git clone git@github.com:david-0/pfila.git
## create .env in git clone root folder
### dev-example
DB_HOST='localhost'
DB_DATABASE='pfila'
DB_PORT=5432
DB_USERNAME='pfila'
DB_PASSWORD='<dbPassword>'

NODE_ENV='dev'
PORT_HTTPS=3002
PORT_HTTP=3001
HOST='localhost'
DEV_SHARED_KEY='sdjhwEEiasdad,in123res'

### prod-example
DB_HOST='localhost'
DB_DATABASE='pfila'
DB_PORT=5432
DB_USERNAME='pfila'
DB_PASSWORD='<dbPassword>'

NODE_ENV='prod'
PORT_HTTPS=443
PORT_HTTP=80
HOST='verschleppt.ch'


## create docker image
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&sudo apt-get install -y nodejs
cd pfila
npm install -g @angular/cli
npm install tsc
npm install typescript
./update.sh

# letsencrypt - certbot
## install certbot

https://certbot.eff.org/instructions?ws=other&os=ubuntufocal

ssh root@<hetzner.cloud.vm>

sudo apt install snapd

sudo snap install --classic certbot

ln -s /snap/bin/certbot /usr/bin/certbot

certbot certonly --standalone
-> answer questions
...
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/www.verschleppt.ch/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/www.verschleppt.ch/privkey.pem
This certificate expires on 2024-04-10.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.
...

docker volume inspect pfila_certificate --> <path>

cd <path>  (/var/lib/docker/volumes/pfila_certificate/_data)
mkdir ssl
cd ssl

ln -s /etc/letsencrypt/live/www.verschleppt.ch/cert.pem
ln -s /etc/letsencrypt/live/www.verschleppt.ch/privkey.pem
ln -s /etc/letsencrypt/live/www.verschleppt.ch/chain.pem


### pre and post hooks for renew certificate
During the renewal of the certificate the port 80 is needed. So there must be a script, that stops the node server and an otherone which starts him again.
cat > /etc/letsencrypt/renewal-hooks/pre/stopPfila.sh << EOF
#!/bin/bash
docker stop \$(docker ps | grep pfila_app | cut -d\   -f1)
EOF
chmod 700 /etc/letsencrypt/renewal-hooks/pre/stopPfila.sh
cat > /etc/letsencrypt/renewal-hooks/post/startPfila.sh << EOF
#!/bin/bash
docker start \$(docker container ls --all | grep pfila_app | cut -d\   -f1)
EOF
chmod 700 /etc/letsencrypt/renewal-hooks/post/startPfila.sh

## jwt pub/private keys (only production)
see: https://en.wikibooks.org/wiki/Cryptography/Generate_a_keypair_using_OpenSSL

docker volume inspect pfila_certificate --> <path>

cd <path>  (/var/lib/docker/volumes/pfila_certificate/_data)
mkdir jwt
cd jwt
### create private key
openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048
### extract public key
openssl rsa -pubout -in private-key.pem -out public-key.pem


