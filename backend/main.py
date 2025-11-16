import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

from fastapi import FastAPI
from core.db import setup_db
from routes.transaction import router as transaction_router
from routes.source import router as source_router
from routes.tag import router as tag_router
from routes.products import router as products_router
from routes.history import router as history_router
from routes.organisation import router as organisation_router

app = FastAPI()

app.include_router(transaction_router, prefix="/api/transaction", tags=["Transactions"])
app.include_router(source_router, prefix="/api/source", tags=["Sources"])
app.include_router(tag_router, prefix="/api/tag", tags=["Tags"])
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(history_router, prefix="/api/history", tags=["History"])
app.include_router(organisation_router, prefix="/api/organisation", tags=["Organisations"])

@app.on_event("startup")
async def startup_event():
    await setup_db()
