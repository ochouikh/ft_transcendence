# import socket
# host = "postgresql" 
# port = 5432
# try:
#         sock = socket.create_connection((host, port), timeout=5)
#         sock.close()
  
# except (socket.timeout, socket.error) as e:
#     exit(-1)
    
# exit(0)


import socket
import time

host = "postgresql"
port = 5432
timeout = 10  # increase timeout to 10 seconds
max_retries = 5

for attempt in range(max_retries):
    try:
        sock = socket.create_connection((host, port), timeout=timeout)
        sock.close()
        print("Connection to PostgreSQL successful!")
        exit(0)
    except (socket.timeout, socket.error) as e:
        print(f"Attempt {attempt + 1}: Connection to PostgreSQL failed. Retrying in 5 seconds...")
        print(f"ERROR {e.__class__}{str(e)}")
        time.sleep(5)

print("Could not connect to PostgreSQL after multiple attempts.")
exit(-1)