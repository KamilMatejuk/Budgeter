run:
	@docker compose down && \
	docker compose up -d && \
	docker compose logs -f backend frontend

types:
	@docker compose run --rm --user $(shell id -u):$(shell id -g) frontend \
		npx openapi-typescript http://backend:8000/openapi.json -o /app/src/types/backend.ts && \
	echo "Applied fix for generated types" && \
        echo "" >> frontend/src/types/backend.ts && \
	echo "export type Tag = components[\"schemas\"][\"Tag\"]" >> frontend/src/types/backend.ts && \
        echo "export type Source = components[\"schemas\"][\"Source\"]" >> frontend/src/types/backend.ts && \
        echo "export type Transaction = components[\"schemas\"][\"Transaction\"]" >> frontend/src/types/backend.ts

