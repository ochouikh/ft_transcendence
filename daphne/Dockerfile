FROM python:3.9

RUN mkdir -p "/app"

WORKDIR /app 

RUN apt-get update \
    && apt-get install -y \
        gcc \
        libpq-dev \
        curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
 
COPY requirements.txt .  

RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install python-dotenv \
    && pip install hvac

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


COPY ./wait-for-vault.sh /
RUN chmod +x /wait-for-vault.sh

# WORKDIR /app

# RUN /bin/bash ./wait-for-vault.sh


ENTRYPOINT ["/bin/bash", "/wait-for-vault.sh"]
CMD ["daphne", "-p", "8000", "-b", "0.0.0.0", "src.asgi:application"]