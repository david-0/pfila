# Pfila-server

## Postgre 
### init
sudo -u postgres -i

createuser --no-superuser --no-createdb --no-createrole -P pfila

createdb -O pfila pfila

### access
sudo -u postgres -i
psql pfila


## Update datebase schema
# Build code to js files
npm run build
# create schema update files 
$(npm bin)/typeorm migration:generate -n addMessageTemplate
