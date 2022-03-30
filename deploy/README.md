# configure environment
## postgre sql configuration
apt update
apt install postgresql

sudo -u postgres -i
createuser -P pfila

### Prod database
createdb -O pfila pfila

### Integration database
createdb -O pfila pfila-int
\q

## insert initial admin user
register user with the frontend
sudo -u postgres -i
psql pfila | pfila-int
insert into role (id,name) values ('1','admin');
insert into role (id,name) values ('2','standard');
insert into role (id,name) values ('3','guest');
insert into user_roles_role ("userId", "roleId") values ('1', '1');

# configure systemd
sudo cp systemd/* /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable node-set-cap
sudo systemctl enable pfila-prod
sudo systemctl enable pfila-int
sudo systemctl start node-set-cab
sudo systemctl start pfila-prod
sudo systemctl start pfila-int

[optional] add these lines to sudoers
Cmnd_Alias PFILA_INT_CMD=/bin/systemctl start pfila-int, /bin/systemctl stop pfila-int
Cmnd_Alias PFILA_PROD_CMD=/bin/systemctl start pfila-prod, /bin/systemctl stop pfila-prod
davidl ALL=(ALL) NOPASSWD: PFILA_INT_CMD,PFILA_PROD_CMD

# Allow Node to bind to port 80 without sudo
(https://gist.github.com/firstdoit/6389682)
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
--> added service above will do the job at every start (node-set-cap)

# letsencrypt on 88.99.118.38 (alixon)
##install certbot
https://certbot.eff.org/lets-encrypt/ubuntubionic-other
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install certbot

## run certbot initially
certbot certonly --standalone
>> email address >> david.leuenberger@gmx.ch
>> Agree >> yes
>> Share email >> no

## config node-server
cd /home/alixon/usr/davidl/website/pfila/certificate/ssl
ln -s /etc/letsencrypt/live/xn--usgwehlt-und-krnt-e0ba.ch/cert.pem
ln -s /etc/letsencrypt/live/xn--usgwehlt-und-krnt-e0ba.ch/privkey.pem
ln -s /etc/letsencrypt/live/xn--usgwehlt-und-krnt-e0ba.ch/chain.pem

## chmod permissions 
setfacl -m u:davidl:rx /etc/letsencrypt/archive
setfacl -m u:davidl:rx /etc/letsencrypt/live
setfacl -m u:davidl:r /etc/letsencrypt/archive/xn--usgwehlt-und-krnt-e0ba.ch/privkey1.pem

## pre and post hooks for renew certificate
During the renewal of the certificate the port 80 is needed. So there must be a script, that stops the node server and an otherone which starts him again.
cat > /etc/letsencrypt/renewal-hooks/pre/stopPfilaServer.sh << EOF
#!/bin/bash
systemctl stop pfila-prod
EOF
chmod 700 /etc/letsencrypt/renewal-hooks/pre/stopPfilaServer.sh
cat > /etc/letsencrypt/renewal-hooks/post/startPfilaServer.sh << EOF
#!/bin/bash
systemctl start pfila-prod
EOF
chmod 700 /etc/letsencrypt/renewal-hooks/post/startPfilaServer.sh

--> renamed to stopNodeServer.sh and startNodeServer.sh

## Change node instance (domain)
edit stopNodeServer.sh and startNodeServer.sh and change service
disable old-service 
enable new-service

systemctl enable / disable 
check with systemctl is-enabled






