#!/bin/sh

set -e


# Wait for Vault to be initialized and unsealed
until curl -s $VAULT_ADDR/v1/sys/health | grep -q '"sealed":false'; do
  echo "Waiting for Vault to be unsealed..."
  sleep 1
done

echo "Vault is up and ready!"
exec "$@"
