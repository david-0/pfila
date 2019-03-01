# Pfila-server

## Postgre 
### init
sudo -u postgres -i

createuser --no-superuser --no-createdb --no-createrole -P pfila

createdb -O pfila pfila

### access
sudo -u postgres -i
psql pfila
