from fastapi import APIRouter

from models.transaction import Transaction, TransactionPartial
from routes.base import CRUDRouterFactory

router = APIRouter()

factory = CRUDRouterFactory(router, "transactions", Transaction, TransactionPartial, "hash")
factory.create_get()
factory.create_post()
factory.create_patch()
factory.create_delete()
