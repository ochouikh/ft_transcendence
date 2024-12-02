FROM nginx:1.27.0

# Install OpenSSL for certificate generation
RUN apt-get update && apt-get install -y openssl \    
    && rm -rf /var/lib/apt/lists/*

# Generate a self-signed SSL certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Company/OU=Department/CN=localhost"

# Install ModSecurity dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg2 \
    build-essential \
    libpcre3 libpcre3-dev libssl-dev zlib1g-dev \
    libtool \
    automake \
    autoconf \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install ModSecurity from source
RUN cd /usr/src && \
    git clone --depth 1 -b v3/master https://github.com/SpiderLabs/ModSecurity && \
    cd ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && \
    make install

# Install ModSecurity Nginx connector
RUN cd /usr/src && \
    git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# Install Nginx with ModSecurity module for version 1.27.0
RUN cd /usr/src && \
    curl -LO http://nginx.org/download/nginx-1.27.0.tar.gz && \
    tar -zxvf nginx-1.27.0.tar.gz && \
    cd nginx-1.27.0 && \
    ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
    make modules && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules

# Create necessary directories for ModSecurity configuration
RUN mkdir -p /etc/modsecurity.d/ /etc/nginx/modsecurity

# Download and install OWASP ModSecurity CRS
RUN git clone https://github.com/coreruleset/coreruleset /usr/share/modsecurity-crs 
# && \
#     ln -s /usr/share/modsecurity-crs /etc/nginx/modsecurity-crs

# Create the log directory and set permissions
RUN mkdir -p /var/log/ \
    && chown -R www-data:www-data /var/log/ \
    && chmod 755 /var/log/

# Copy modsecurity.conf from your nginx folder to the correct ModSecurity directory
COPY ./modsecurity.conf /etc/modsecurity.d/modsecurity.conf

# Set up ModSecurity rules and configuration
RUN ln -s /usr/share/modsecurity-crs /etc/nginx/modsecurity-crs && \
    ln -s /etc/nginx/modsecurity-crs/crs-setup.conf /etc/modsecurity.d/ && \
    ln -s /etc/modsecurity.d/modsecurity.conf /etc/nginx/modsecurity/modsecurity.conf

# Copy Nginx configuration (if any)
COPY nginx.conf /etc/nginx/nginx.conf
COPY crs-setup.conf /etc/nginx/modsecurity-crs/crs-setup.conf

RUN mkdir -p /frontend

EXPOSE 80
EXPOSE 443