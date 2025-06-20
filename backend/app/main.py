from fastapi import FastAPI
from app.api.routes import transaction

app = FastAPI()

app.include_router(transaction.router, prefix="/api/transactions", tags=["Transactions"])
