run:
	@docker compose down && \
	docker compose up -d && \
	docker compose logs -f backend frontend

prod:
	@docker compose down && \
	PROD=true docker compose up -d && \
	docker compose logs -f backend frontend

logs:
	@docker compose logs -f backend frontend

types:
	@docker compose run --rm --user $(shell id -u):$(shell id -g) frontend \
		npx openapi-typescript http://backend:8000/openapi.json \
			--output /app/src/types/backend.ts \
			--export-type \
			--root-types \
			--root-types-no-schema-prefix

check:
	@docker compose run --rm frontend npx tsc --noEmit && \
	 docker compose run --rm frontend npx knip --config knip.json

backup:
	@curl -s http://localhost:48522/api/backup \
	  	-H "Content-Type: application/json" \
  		-d '{"auto":true, "name":"Backup from Makefile"}'

exchange_rates:
	@bash forex.sh
