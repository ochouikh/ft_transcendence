#!/bin/bash
set -e


# First, Fetch the credentials from Vault Container

VAULT_ADDR=${VAULT_ADDR}
VAULT_DEV_ROOT_TOKEN_ID=${VAULT_DEV_ROOT_TOKEN_ID}


# Wait for Vault to be available
until db_secrets=$(curl -s --header "X-Vault-Token: $VAULT_DEV_ROOT_TOKEN_ID" "$VAULT_ADDR/v1/secret/db" | jq -e '.data' > /dev/null); do
    echo "Database credentials not available yet, retrying in 5 seconds..."
    sleep 5
done

echo "Vault is up!"

db_secrets=$(curl -s --header "X-Vault-Token: $VAULT_DEV_ROOT_TOKEN_ID" "$VAULT_ADDR/v1/secret/db")


# Set PostgreSQL environment variables
POSTGRES_DB=$(echo $db_secrets | jq -r '.data.POSTGRES_DB')
POSTGRES_USER=$(echo $db_secrets | jq -r '.data.POSTGRES_USER')
POSTGRES_PASSWORD=$(echo $db_secrets | jq -r '.data.POSTGRES_PASSWORD')


echo "Creating PostgreSQL user and database..."


# Start PostgreSQL service
service postgresql start

# Wait for PostgreSQL to start up
until pg_isready -U "$POSTGRES_USER"; do
    echo "Waiting for PostgreSQL to start..."
    sleep 2
done

# Modify pg_hba.conf to use password authentication
PG_HBA_CONF="/etc/postgresql/13/main/pg_hba.conf"

# Backup the original pg_hba.conf
cp "$PG_HBA_CONF" "$PG_HBA_CONF.bak"

# Replace all occurrences of 127.0.0.1 with 0.0.0.0
sed -i 's/127\.0\.0\.1\/32/0.0.0.0\/0/g' "$PG_HBA_CONF"
sed -i 's/::1/::/g' "$PG_HBA_CONF"
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "/etc/postgresql/13/main/postgresql.conf"


# Reload PostgreSQL configuration to apply changes
service postgresql reload

# Create user and database if they don't exist, ensuring correct password is set.
su $POSTGRES_USER -c "psql -v ON_ERROR_STOP=1 --username \"$POSTGRES_USER\" <<-EOSQL
    ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
    SELECT 'CREATE DATABASE $POSTGRES_DB' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\\gexec
EOSQL"

service postgresql stop

echo "Database and table initialized successfully."
su $POSTGRES_USER -c "exec /usr/lib/postgresql/13/bin/postgres -D /etc/postgresql/13/main"
# DO BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN CREATE ROLE postgres WITH LOGIN PASSWORD 'pass'; END IF; END ;
