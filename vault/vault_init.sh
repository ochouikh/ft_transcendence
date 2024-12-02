#!/bin/sh


# Start Vault in server mode
vault server -config=/vault/config/vault.hcl &
VAULT_PID=$!

sleep 10


apk add --no-cache jq curl

# Check if Vault is initialized
vault_status=$(vault status -format=json)
initialized=$(echo "$vault_status" | jq -r '.initialized')



if [ "$initialized" != "true" ]; then
    # Initialize Vault if not initialized
    vault policy write db-policy /vault/config/db-policy.hcl
    echo "------------------> Initializing Vault..."
    INIT_OUTPUT=$(vault operator init -key-shares=1 -key-threshold=1)
    if [ $? -ne 0 ]; then
        echo "Failed to initialize Vault."
        exit 1
    fi

    # Extract root token and unseal key and save them
    ROOT_TOKEN=$(echo "$INIT_OUTPUT" | grep 'Initial Root Token:' | awk '{print $NF}')
    UNSEAL_KEY=$(echo "$INIT_OUTPUT" | grep 'Key 1:' | awk '{print $NF}')
    echo $UNSEAL_KEY > /vault/file/unseal_key.txt
else
    # Vault is already initialized, use the root token and unseal key from the environment or stored file
    echo "------------------> Vault is already initialized."
    ROOT_TOKEN=$VAULT_DEV_ROOT_TOKEN_ID
    UNSEAL_KEY=$(cat /vault/file/unseal_key.txt)
fi

# Check if Vault is sealed
sealed=$(echo "$vault_status" | jq -r '.sealed')

if [ "$sealed" == "true" ]; then
    echo "------------------> Unsealing Vault..."
    # Unseal Vault using the stored unseal key
    vault operator unseal $UNSEAL_KEY
    if [ $? -ne 0 ]; then
        echo "Failed to unseal Vault."
        exit 1
    fi
else
    echo "------------------> Vault is already unsealed."
fi

# Authenticate with Vault
vault login $ROOT_TOKEN
if [ $? -ne 0 ]; then
    echo "Failed to log in to Vault."
    exit 1
fi


vault secrets enable -path=secret kv

# Check if secrets are already stored
stored_secrets=$(vault kv get -format=json secret/db)
if [ $? -ne 0 ]; then

    vault token create -id=$VAULT_DEV_ROOT_TOKEN_ID -policy=root
    if [ $? -ne 0 ]; then
        echo "Failed to create new token."
        exit 1
    fi

    # Secrets not found, store the secrets
    echo "------------------> Storing database secrets..."
    vault kv put secret/db POSTGRES_DB='db' POSTGRES_USER='postgres' POSTGRES_PASSWORD='IQkxU8QzrYDK8wNR' POSTGRES_HOST='postgresql' POSTGRES_PORT='5432'
    
    echo "------------------> Storing settings secrets..."
    vault kv put secret/settings SECRET_KEY='django-insecure-72-!c2*h-o(&b2#u^6y+-k(11gns*37t1)esg_p%+gciuvyxqk' \
        DEBUG=True EMAIL_BACKEND='users.backends.EmailBackend' EMAIL_HOST='smtp.gmail.com' EMAIL_PORT='587' \
        EMAIL_USE_TLS=True EMAIL_HOST_USER='akatech1337@gmail.com' EMAIL_HOST_PASSWORD='kuyicszsaydvqbzk' \
        DJANGO_SETTINGS_MODULE=backend.backend.src.settings

    echo "------------------> Storing OAuth secrets..."
    vault kv put secret/oauth CLIENT_ID_42='u-s4t2ud-44a62ccffb37e6be0d11a44cf0710659d2ae46f9fbe2b28a5205a434bced59f7' \
        CLIENT_SECRET_42='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'\
        CLIENT_ID_GOOGLE='358882639069-gvteeah15njmbuu49k8fuih2nvlov3su.apps.googleusercontent.com'\
        CLIENT_SECRET_GOOGLE='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'
else
    echo "------------------> Secrets are already stored. Skipping kv put."
fi

# Enable KV secrets engine if it's not already enabled
secrets_status=$(vault secrets list -format=json | jq -r '.["secret/"]')
if [ "$secrets_status" == "null" ]; then
    echo "------------------> Enabling KV secrets engine..."
    vault secrets enable -path=secret kv
else
    echo "------------------> KV secrets engine is already enabled."
fi

echo "------------------> Vault is up and ready!"

# Keep the container running
wait $VAULT_PID