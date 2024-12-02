FROM debian:bullseye-slim

# Install necessary packages
RUN apt-get update && \
    apt-get install -y wget gnupg2 postgresql postgresql-contrib && \
    apt-get clean && \
    apt-get install -y jq curl && \
    rm -rf /var/lib/apt/lists/*

# Copy custom initialization script into the container
COPY custom_init.sh /usr/local/bin/custom_init.sh

# Make sure the script is executable
RUN chmod +x /usr/local/bin/custom_init.sh

# Expose PostgreSQL port
EXPOSE 5432

# Start PostgreSQL and run the custom initialization script
CMD ["bash", "-c", "/usr/local/bin/custom_init.sh"]