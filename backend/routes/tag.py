from fastapi import APIRouter

from routes.base import CRUDRouterFactory
from models.tag import Tag, TagPartial

router = APIRouter()

factory = CRUDRouterFactory(router, "tags", Tag, TagPartial)
factory.create_get()
factory.create_post()
factory.create_patch()
factory.create_delete()
