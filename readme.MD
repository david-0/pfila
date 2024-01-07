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
apt install docker git
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

## create docker image
cd pfila
./update.sh







