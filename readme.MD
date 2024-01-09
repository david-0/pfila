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
