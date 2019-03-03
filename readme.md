# initialize new project
## create angular-cli
npm install @angular/cli

$(npm bi)/ng new client
cd client
$(npm bin)/ng serve

# configure environment
## postgre sql configuration
apt update
apt install postgresql

sudo -u postgres -i
createuser -P pfila
createdb -O pfila pfila
\q

### insert initial admin user
// this part can not be done after the app is initialy started, otherwise, the tables doesn't exists
// create initial admin user and set password (for example abc), please change at first login
sudo -u postgres -i
psql pfila
insert into "user" (id, email, firstname, lastname, password) values ('1','<user-Email>','<firstName>','<lastName>','');
update "user" set password='$2a$10$VFhy9Jt1U2XHh8lnWVdym.n6Y0gBTdyZNfm8hbNqBdcQQN2BwC2Gy' where id=1;
insert into role (id,name) values ('1','admin');
insert into role (id,name) values ('2','standard');
insert into role (id,name) values ('3','guest');
insert into user_roles_role ("userId", "roleId") values ('1', '1');
insert into user_roles_role ("userId", "roleId") values ('1', '2');
insert into user_roles_role ("userId", "roleId") values ('1', '3');

## install nodejs
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs

### Allow Node to bind to port 80 without sudo
(https://gist.github.com/firstdoit/6389682)
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node

## create directory
mkdir website
cd website

## ssl crt/key (with letsencrypt) (only production)
### domain certificates
mkdir certificate/ssl
cd certificate/ssl
ln -s /etc/apache2/ssl/uf-und-drvoo.ch.key uf-und-drvoo.key
ln -s /etc/apache2/ssl/uf-und-drvoo.ch.crt uf-und-drvoo.crt
ln -s uf-und-drvoo.key privkey.pem
ln -s uf-und-drvoo.crt cert.pem

### intermediate certificate
https://letsencrypt.org/certificates/
wget https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem.txt
ln -s lets-encrypt-x3-cross-signed.pem.txt chain.pem
cd ../..

## jwt pub/private keys (only production)
see: https://en.wikibooks.org/wiki/Cryptography/Generate_a_keypair_using_OpenSSL
mkdir certificate/jwt
cd certificate/jwt
### create private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
### extract public key
openssl rsa -pubout -in private_key.pem -out public_key.pem
cd ../..

## checkout website
git clone https://github.com/david-0/pfila.git
cd pfila

## install dependencies (incl. cleanup)
npm install

## build or scp from notebook
npm run build
or build on notebook and copy
scp -r server/dist davidl@88.99.118.38:~/website/pfila/server/

## start node server
npm start

## clean
npm run clean

