from fastapi import FastAPI
from app.api.routes.transaction import router as transaction_router
from app.api.routes.source import router as source_router
from app.api.routes.tag import router as tag_router

app = FastAPI()

app.include_router(transaction_router, prefix="/api/transaction", tags=["Transactions"])
app.include_router(source_router, prefix="/api/source", tags=["Sources"])
app.include_router(tag_router, prefix="/api/tag", tags=["Tags"])
