FROM vault:1.13.2

# Set the working directory
# WORKDIR /vault/config

# Copy your custom Vault configuration and initialization script into the container
COPY ./vault.hcl /vault/config/vault.hcl
COPY ./vault_init.sh /vault/config/vault_init.sh
COPY ./db-policy.hcl /vault/config/db-policy.hcl

# Ensure the init script has execute permissions
RUN chmod +x /vault/config/vault_init.sh

# Expose Vault's default port
EXPOSE 8200

# Start Vault using the init script, ensuring it handles both setup and running Vault
CMD ["/vault/config/vault_init.sh"]