run:
	@docker compose down && \
	docker compose up -d && \
	docker compose logs -f backend frontend

types:
	@docker compose run --rm --user $(shell id -u):$(shell id -g) frontend \
		npx openapi-typescript http://backend:8000/openapi.json \
			--output /app/src/types/backend.ts \
			--export-type \
			--root-types \
			--root-types-no-schema-prefix
