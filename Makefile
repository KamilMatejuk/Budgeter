NAME_DEV := budgeter-dev
NAME_PROD := budgeter-prod

stop:
	@docker compose -p $(NAME_DEV) down --remove-orphans
	@docker compose -p $(NAME_PROD) down --remove-orphans

run:
	@make stop && \
	mkdir -p ./db.dev/mongo && \
	docker compose -p $(NAME_DEV) -f docker-compose.yml -f docker-compose.dev.yml up -d && \
	docker compose -p $(NAME_DEV) logs -f backend frontend

prod:
	@make stop && \
	sudo mkdir -p /var/lib/budgeter/mongo && \
	docker compose -p $(NAME_PROD) -f docker-compose.yml -f docker-compose.prod.yml up -d && \
	docker compose -p $(NAME_PROD) logs -f backend frontend


types:
	@docker compose -p $(NAME_DEV) -f docker-compose.yml -f docker-compose.dev.yml run \
		--rm --user $(shell id -u):$(shell id -g) frontend \
		npx openapi-typescript http://backend:8000/openapi.json \
			--output /app/src/types/backend.ts \
			--export-type \
			--root-types \
			--root-types-no-schema-prefix

check:
	@docker compose -p $(NAME_DEV) -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend npx tsc --noEmit && \
	 docker compose -p $(NAME_DEV) -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend npx knip --config knip.json

backup:
	@curl -s http://localhost:48522/api/backup \
	  	-H "Content-Type: application/json" \
  		-d '{"auto":true, "name":"Backup from Makefile"}'
