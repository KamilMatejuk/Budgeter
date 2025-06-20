run:
	docker compose up

types:
	docker compose run backend datamodel-codegen \
		--input backend/app/models/transaction.py \
		--input-file-type python \
		--output frontend/src/types/transaction.ts
