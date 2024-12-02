FROM python:3.9

RUN mkdir -p  "/app"

WORKDIR /app 


RUN apt-get update \
    && apt-get install -y \
        gcc \
        libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
 
COPY  requirements.txt .  

RUN pip install gunicorn 
RUN pip install --upgrade pip \
    && pip install -r requirements.txt && \
    pip install python-dotenv && \
    pip install hvac


EXPOSE 8000
COPY entry-point.sh / 
COPY connection_checker.py  / 

RUN chmod 777  /entry-point.sh

CMD ["bash", "/entry-point.sh"]
