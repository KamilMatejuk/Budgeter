from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from routes.base import CRUDRouterFactory, create, fail_wrapper, get, patch
from models.organisation import Organisation, OrganisationPartial, OrganisationWithId

router = APIRouter()

factory = CRUDRouterFactory(router, "organisations", Organisation, OrganisationPartial, OrganisationWithId)
factory.create_get()
factory.create_get_by_id()
factory.create_delete()

@router.get("/regex/{name}", response_model=OrganisationWithId)
async def get_organisation_by_name_regex(name: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        organisations: list[OrganisationWithId] = await get(db, "organisations", OrganisationWithId)
        for org in organisations:
            if org.pattern.lower() in name.lower():
                return org
            if org.name.lower() == name.lower():
                return org
        return Organisation(pattern="", name=name).model_dump(by_alias=True, mode="json")
    return await inner()


@router.post("", response_model=OrganisationWithId)
async def create_organisation(data: Organisation, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        item = await create(db, "organisations", OrganisationWithId, data)
        # update matching transactions
        async for doc in db["transactions"].find({}):
            if item.pattern.lower() in doc["organisation"].lower():
                await db["transactions"].update_many({"_id": doc["_id"]}, {"$set": {"organisation": item.name}})
        return item
    return await inner()


@router.patch("", response_model=OrganisationWithId)
async def patch_organisation(data: OrganisationPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        prev = await get(db, "organisations", OrganisationWithId, {"_id": str(data.id)}, one=True)
        item = await patch(db, "organisations", OrganisationWithId, data)
        # update matching transactions if name changed
        if prev.name != item.name:
            async for doc in db["transactions"].find({"organisation": prev.name}):
                await db["transactions"].update_many({"_id": doc["_id"]}, {"$set": {"organisation": item.name}})
        return item
    return await inner()
