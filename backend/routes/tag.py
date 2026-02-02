from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from models.base import PyObjectId
from routes.base import fail_wrapper, get, create, patch, delete
from models.tag import Tag, TagPartial, TagWithId, TagRichWithId, TagRequest
from routes.utils import get_tag_parent, get_rich_tag, get_tag_children, get_all_tag_children, get_all_tag_children_ids


router = APIRouter()


@router.get("", response_model=list[TagWithId] | dict)
async def get_tags(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        root_tags = await get(db, "tags", TagWithId, {"parent": None})
        root_tags = sorted(root_tags, key=lambda t: t.name.lower())
        response = []
        for tag in root_tags:
            response.extend([tag] + await get_all_tag_children(tag, db))
        return response
    return await inner()


@router.get("/rich", response_model=list[TagRichWithId] | dict)
async def get_tags_rich(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        return [await get_rich_tag(t, db) for t in await get_tags(db)]
    return await inner()


@router.get("/used", response_model=list[TagRichWithId] | dict)
async def get_tags_used(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        tags = await get_tags_rich(db)
        used_tags = []
        for tag in tags:
            this_tag_id = [str(tag.id)]
            child_tag_ids = await get_all_tag_children_ids(str(tag.id), db)
            condition = {"deleted": False, "tags": {"$in": this_tag_id + child_tag_ids}}
            count = await db["transactions"].count_documents(condition)
            if count > 0: used_tags.append(tag)
            # other
            other_condition = {"deleted": False, "tags": {"$in": this_tag_id, "$nin": child_tag_ids}}
            other_count = await db["transactions"].count_documents(other_condition)
            if other_count < count and other_count > 0:
                tag = TagRichWithId(_id=str(PyObjectId()), name=f"{tag.name}/Other", colour=tag.colour)
                used_tags.append(tag)
        # sort by name, but Other goes last
        return sorted(used_tags, key=lambda t: t.name.replace("Other", chr(ord('Ż') + 1)).lower())
    return await inner()


@router.post("", response_model=TagWithId | dict)
async def create_tag(data: TagRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        parent = await get_tag_parent(data, db)
        # get color
        data.colour = data.colour or (parent.colour if parent else "#FFFFFF")
        item = await create(db, "tags", TagWithId, data)
        # add to parent's children
        if parent:
            parent.children = (parent.children or []) + [str(item.id)]
            await patch(db, "tags", TagWithId, parent)
        return item
    return await inner()


@router.patch("", response_model=TagWithId | dict)
async def patch_tag(data: TagPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        item = await patch(db, "tags", TagWithId, data)
        # recursively update colour in children
        if data.colour:
            async def f(tag: Tag):
                for child in await get_tag_children(tag, db):
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
            for child in await get_tag_children(tag, db):
                await f(child)
            await delete(db, "tags", str(tag.id))
            removed_ids.add(str(tag.id))
        await f(tag)
        # remove from parent
        parent = await get_tag_parent(tag, db)
        if parent:
            parent.children = [c for c in (parent.children or []) if c != str(id)]
            await patch(db, "tags", TagWithId, parent)
        # detach from transactions
        await db["transactions"].update_many(
            {"tags": {"$in": list(removed_ids)}},
            {"$pull": {"tags": {"$in": list(removed_ids)}}})
        return {}
    return await inner()
