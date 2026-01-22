from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import fail_wrapper, get, create, patch, delete
from models.tag import Tag, TagPartial, TagWithId, TagRichWithId, TagRequest
from core.db import get_db


async def get_parent(tag: Tag | str, db: AsyncIOMotorDatabase) -> TagWithId | None:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag.parent: return None
    return await get(db, "tags", TagWithId, {"_id": tag.parent}, one=True)


async def get_children(tag: Tag | str, db: AsyncIOMotorDatabase) -> list[TagWithId]:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag.children: return []
    children = []
    for child_id in tag.children:
        child = await get(db, "tags", TagWithId, {"_id": child_id}, one=True)
        if not child: continue
        children.append(child)
    return children


async def get_all_children(tag: Tag | str, db: AsyncIOMotorDatabase) -> list[TagWithId]:
    res = []
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag: return res
    children = await get_children(tag, db)
    children = sorted(children, key=lambda t: t.name.lower())
    for child in children:
        res.extend([child] + await get_all_children(child, db))
    return res

async def get_all_children_ids(tag: Tag | str, db: AsyncIOMotorDatabase) -> list[str]:
    res = []
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag: return res
    if not tag.children: return res
    for child in tag.children:
        res.extend([child] + await get_all_children_ids(child, db))
    return res


async def get_name(tag: Tag | str, db: AsyncIOMotorDatabase) -> str:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag.parent: return tag.name
    parent = await get_parent(tag, db)
    return f"{await get_name(parent, db)}/{tag.name}"


async def sort_by_name(tags: list[str], db: AsyncIOMotorDatabase):
    tags = list(set(tags))
    tags: list[TagWithId] = [await get(db, "tags", TagWithId, {"_id": t}, one=True) for t in tags]
    for t in tags: t.name = await get_name(t, db)
    tags = sorted(tags, key=lambda t: not t.name.startswith("Wyjazdy"))
    return [str(t.id) for t in tags]


async def get_rich_tag(tag: str, db: AsyncIOMotorDatabase) -> TagRichWithId:
    t: TagWithId = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    t.name = await get_name(t, db)
    return TagRichWithId(_id=str(t.id), name=t.name, colour=t.colour)


async def get_rich_tags(tags: list[str], db: AsyncIOMotorDatabase) -> list[TagRichWithId]:
    tags = list(set(tags))
    return [await get_rich_tag(t, db) for t in tags]


router = APIRouter()


@router.get("", response_model=list[TagWithId])
async def get_tags(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        root_tags = await get(db, "tags", TagWithId, {"parent": None})
        root_tags = sorted(root_tags, key=lambda t: t.name.lower())
        response = []
        for tag in root_tags:
            response.extend([tag] + await get_all_children(tag, db))
        return response
    return await inner()


@router.get("/rich", response_model=list[TagRichWithId])
async def get_tags_rich(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        return await get_rich_tags([str(t.id) for t in await get_tags(db)], db)
    return await inner()


@router.get("/rich/{id}", response_model=TagRichWithId)
async def get_tag_rich(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        return await get_rich_tag(id, db)
    return await inner()


@router.post("", response_model=TagWithId)
async def create_tag(data: TagRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        parent = await get_parent(data, db)
        # get color
        data.colour = data.colour or (parent.colour if parent else "#FFFFFF")
        item = await create(db, "tags", TagWithId, data)
        # add to parent's children
        if parent:
            parent.children = (parent.children or []) + [str(item.id)]
            await patch(db, "tags", TagWithId, parent)
        return item
    return await inner()


@router.patch("", response_model=TagWithId)
async def patch_tag(data: TagPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        item = await patch(db, "tags", TagWithId, data)
        # recursively update colour in children
        if data.colour:
            async def f(tag: Tag):
                for child in await get_children(tag, db):
                    child.colour = data.colour
                    await patch(db, "tags", TagWithId, child)
                    await f(child)
            await f(item)
        return item
    return await inner()


@router.delete("/{id}", response_model=dict)
async def delete_tag(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        removed_ids = set()
        tag: Tag = await get(db, "tags", Tag, {"_id": id}, one=True)
        # recursively remove all children
        async def f(tag: Tag):
            for child in await get_children(tag, db):
                await f(child)
            await delete(db, "tags", str(tag.id))
            removed_ids.add(str(tag.id))
        await f(tag)
        # remove from parent
        parent = await get_parent(tag, db)
        if parent:
            parent.children = [c for c in (parent.children or []) if c != str(id)]
            await patch(db, "tags", TagWithId, parent)
        # detach from transactions
        await db["transactions"].update_many(
            {"tags": {"$in": list(removed_ids)}},
            {"$pull": {"tags": {"$in": list(removed_ids)}}})
        return {}
    return await inner()
