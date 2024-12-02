#--------< >---------------------------------------------------------
DATABASE_VOLUME 		=  	./database_volume 
BACKEND_VOLUME 			=  	./backend
FRONTEND_VOLUME 		=  	./frontend/dist   
VAULT_VOLUME 			=  	./vault_volume   

#----< Colors >-------------------------------------------------------
# Define ANSI color codes
RED  	= \033[31m
GREEN   := \033[32m
YELLOW  := \033[33m
BLUE    := \033[34m
RESET   := \033[0m



default: frontend backend  build up  

build:  .env  
	docker-compose build  

up: frontend backend .env  
	mkdir -p $(DATABASE_VOLUME) $(BACKEND_VOLUME) $(FRONTEND_VOLUME) $(VAULT_VOLUME)
	docker-compose up --build  

clean: 
	docker stop -f 		$(shell docker ps -qa )        || true
	docker container rm $(docker container ls -aq) 	   || true
	docker rm 			$(shell docker ps -qa)         || true
	docker rmi -f 		$(shell docker images -qa)     || true
	docker volume rm 	$(shell docker volume ls -q)   || true
	docker network rm 	$(shell docker network ls -q)  || true


# ------< automation rules >------------------

frontend:
	@cd $@; ([ -d node_modules ]   ||  npm install  ) 	&& echo "$(GREEN)√ node modules file exist $(RESET)"
	@cd $@; ([ -d dist ] 		   || npm run  build ) 			&&  echo "$(GREEN)√ dist file exist$(RESET)"

frontend-force:
	@cd $@;  npm install  	 || echo "$(GREEN)√node modules file exist $(RESET)"
	@cd $@;  npm run  build  || echo "$(GREEN)√dist file exist$(RESET)"

backend:
	@rm -rf ./gunicorn/requirements.txt || true
	@rm -rf ./daphne/requirements.txt 	|| true
	
	@echo  "$(RED) Cleaning up old requirements [gunicorn, daphne]$(RESET)"
	
	@cp ./backend/requirements.txt ./gunicorn/requirements.txt 
	@cp ./backend/requirements.txt ./daphne/requirements.txt 

	@echo  "$(GREEN)Copying new requirements...$(RESET)"



.PHONY :  gunicron  nginx  frontend  backend 


