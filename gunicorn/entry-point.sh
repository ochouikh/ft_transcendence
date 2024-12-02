#!/usr/bin/env bash

echo "<***********< wait ....  >***************>"

# Exit immediately if a command exits with a non-zero status.
set -e

# Wait for Vault to be initialized and unsealed
until curl -s $VAULT_ADDR/v1/sys/health | grep -q '"sealed":false'; do
  echo "Waiting for Vault to be unsealed..."
  sleep 5
done

echo "Vault is up and unsealed!"

# Check for database availability
sleep 7

until python /connection_checker.py; do
    echo "Waiting for the database to be available..."
    sleep 5
done 

echo "<***********< Running migrations >***************>"
if ! python manage.py makemigrations; then
    echo "Migration failed!"
    exit 1
fi

if ! python manage.py migrate; then
    echo "Migration failed!"
    exit 1
fi

echo "<***********< Starting Gunicorn  >***************>" 
exec gunicorn --bind 0.0.0.0:8000 src.wsgi:application
