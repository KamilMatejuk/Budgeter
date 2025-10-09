from fastapi import APIRouter

from routes.base import CRUDRouterFactory
from models.tag import Tag, TagPartial, TagWithId

router = APIRouter()

factory = CRUDRouterFactory(router, "tags", Tag, TagPartial, TagWithId)
factory.create_get()
factory.create_post()
factory.create_patch()
factory.create_delete()
