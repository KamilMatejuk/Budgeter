from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import CRUDRouterFactory, fail_wrapper, get, create, patch, delete
from models.tag import Tag, TagPartial, TagWithId, TagRequest
from core.db import get_db


COLOR_ALPHA_PROGRESSION = ["FF", "7F", "4C", "26"]


async def get_parent(tag: Tag, db: AsyncIOMotorDatabase) -> Tag | None:
    if not tag.parent: return None
    return await get(db, "tags", Tag, {"_id": tag.parent}, one=True)


async def get_children(tag: Tag, db: AsyncIOMotorDatabase) -> list[Tag]:
    if not tag.children: return []
    children = []
    for child_id in tag.children:
        child = await get(db, "tags", Tag, {"_id": child_id}, one=True)
        if not child: continue
        children.append(child)
    return children


def getNextColor(current_color: str) -> str:
    current_alpha = current_color[-2:]
    try: current_alpha_index = COLOR_ALPHA_PROGRESSION.index(current_alpha)
    except ValueError:  current_alpha_index = -1
    if current_alpha_index < len(COLOR_ALPHA_PROGRESSION) - 1:
        next_alpha = COLOR_ALPHA_PROGRESSION[current_alpha_index + 1]
    else: next_alpha = COLOR_ALPHA_PROGRESSION[-1]
    return current_color[:-2] + next_alpha


router = APIRouter()
factory = CRUDRouterFactory(router, "tags", Tag, TagPartial, TagWithId)
factory.create_get()
factory.create_get_by_id()


@router.post("", response_model=TagWithId)
async def create_tag(data: TagRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        parent = await get_parent(data, db)
        # use parent colour
        if not parent: data.colour = (data.colour[:-2] or "#000000") + "FF"
        else: data.colour = getNextColor(parent.colour)
        item = await create(db, "tags", TagWithId, data)
        # add to parent's children
        if parent:
            parent.children = (parent.children or []) + [str(item.id)]
            await patch(db, "tags", TagPartial, parent)
        return item
    return await inner()


@router.patch("", response_model=TagWithId)
async def patch_tag(data: TagPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        item = await patch(db, "tags", TagWithId, data)
        # recursively update colour in children
        async def f(tag: Tag):
            for child in await get_children(tag, db):
                child.colour = getNextColor(tag.colour)
                await patch(db, "tags", TagPartial, child)
                await f(child)
        await f(item)
        return item
    return await inner()


@router.delete("/{id}", response_model=dict)
async def delete_tag(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        tag: Tag = await get(db, "tags", Tag, {"_id": id}, one=True)
        # recursively remove all children
        async def f(tag: Tag):
            for child in await get_children(tag, db):
                await f(child)
            await delete(db, "tags", str(tag.id))
        await f(tag)
        # remove from parent
        parent = await get_parent(tag, db)
        if parent:
            parent.children = [c for c in (parent.children or []) if c != str(id)]
            await patch(db, "tags", TagPartial, parent)
        return {}
    return await inner()
