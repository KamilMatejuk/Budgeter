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
        echo "export type Transaction = components[\"schemas\"][\"Transaction\"]" >> frontend/src/types/backend.ts && \
        echo "export type Currency = components[\"schemas\"][\"Currency\"]" >> frontend/src/types/backend.ts && \
        echo "export type Capitalization = components[\"schemas\"][\"Capitalization\"]" >> frontend/src/types/backend.ts
		echo "export type Cash = components[\"schemas\"][\"Cash\"]" >> frontend/src/types/backend.ts && \
		echo "export type CashPartial = components[\"schemas\"][\"CashPartial\"]" >> frontend/src/types/backend.ts && \
		echo "export type Salary = components[\"schemas\"][\"Salary\"]" >> frontend/src/types/backend.ts && \
		echo "export type SalaryPartial = components[\"schemas\"][\"SalaryPartial\"]" >> frontend/src/types/backend.ts && \
		echo "export type PersonalAccount = components[\"schemas\"][\"PersonalAccount\"]" >> frontend/src/types/backend.ts && \
		echo "export type PersonalAccountPartial = components[\"schemas\"][\"PersonalAccountPartial\"]" >> frontend/src/types/backend.ts && \
		echo "export type Card = components[\"schemas\"][\"Card\"]" >> frontend/src/types/backend.ts && \
		echo "export type CardPartial = components[\"schemas\"][\"CardPartial\"]" >> frontend/src/types/backend.ts && \
		echo "export type SavingsAccount = components[\"schemas\"][\"SavingsAccount\"]" >> frontend/src/types/backend.ts && \
		echo "export type SavingsAccountPartial = components[\"schemas\"][\"SavingsAccountPartial\"]" >> frontend/src/types/backend.ts && \
		echo "export type StockAccount = components[\"schemas\"][\"StockAccount\"]" >> frontend/src/types/backend.ts && \
		echo "export type StockAccountPartial = components[\"schemas\"][\"StockAccountPartial\"]" >> frontend/src/types/backend.ts && \
		echo "export type CapitalInvestment = components[\"schemas\"][\"CapitalInvestment\"]" >> frontend/src/types/backend.ts && \
		echo "export type CapitalInvestmentPartial = components[\"schemas\"][\"CapitalInvestmentPartial\"]" >> frontend/src/types/backend.ts
