from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import get
from core.utils import Date
from models.base import PyObjectId
from models.products import PersonalAccountWithId
from models.organisation import OrganisationWithId
from models.tag import Tag, TagWithId, TagRichWithId, Join
from models.history import AccountDailyHistory, ChartRange


def range_to_dates(range: ChartRange):
    this_month = Date.this_month()
    if range == ChartRange._3M:
        start = Date.add_months(this_month, -2)
    elif range == ChartRange._1Y:
        start = Date.add_months(this_month, -11)
    elif range == ChartRange._FULL:
        start = None
    else:
        raise ValueError(f"Invalid range {range}")
    return start


async def remove_leading_zero_history(account: PersonalAccountWithId, db: AsyncIOMotorDatabase):
    hist: list[AccountDailyHistory] = await get(db, "account_daily_history", AccountDailyHistory,
                                                {"account": str(account.id)}, "date", reverse=False)
    to_remove = []
    for h in hist:
        if h.value != 0.0: break
        to_remove.append(h)
    # leave one zero record to avoid empty history
    if len(to_remove) > 1:
        to_remove = to_remove[:-1]
    for h in to_remove:
        await db["account_daily_history"].delete_one({"_id": str(h.id)})


async def match_organisation_by_name_regex(name: str, organisations: list[OrganisationWithId]):
    for org in organisations:
        for pattern in org.patterns:
            if pattern.lower() in name.lower():
                return org
        if org.name.lower() == name.lower():
            return org
    return OrganisationWithId(_id=str(PyObjectId()), patterns=[], name=name, tags=[], icon=None)


async def get_organisation_name_by_name_regex(name: str, db: AsyncIOMotorDatabase):
    organisations: list[OrganisationWithId] = await get(db, "organisations", OrganisationWithId)
    org = await match_organisation_by_name_regex(name, organisations)
    if isinstance(org, OrganisationWithId): return org.name
    return name


async def get_tag_parent(tag: Tag | str, db: AsyncIOMotorDatabase) -> TagWithId | None:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag.parent: return None
    return await get(db, "tags", TagWithId, {"_id": tag.parent}, one=True)


async def get_tag_children(tag: Tag | str, db: AsyncIOMotorDatabase) -> list[TagWithId]:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag.children: return []
    children = []
    for child_id in tag.children:
        child = await get(db, "tags", TagWithId, {"_id": child_id}, one=True)
        if not child: continue
        children.append(child)
    return children


async def get_all_tag_children(tag: Tag | str, db: AsyncIOMotorDatabase) -> list[TagWithId]:
    res = []
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag: return res
    children = await get_tag_children(tag, db)
    children = sorted(children, key=lambda t: t.name.lower())
    for child in children:
        res.extend([child] + await get_all_tag_children(child, db))
    return res

async def get_all_tag_children_ids(tag: Tag | str, db: AsyncIOMotorDatabase) -> list[str]:
    res = []
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag: return res
    if not tag.children: return res
    for child in tag.children:
        res.extend([child] + await get_all_tag_children_ids(child, db))
    return res


async def get_tag_name(tag: Tag | str, db: AsyncIOMotorDatabase) -> str:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag.parent: return tag.name
    parent = await get_tag_parent(tag, db)
    return f"{await get_tag_name(parent, db)}/{tag.name}"


async def sort_tags_by_name(tags: list[str], db: AsyncIOMotorDatabase):
    tags = list(set(tags))
    tags: list[TagWithId] = [await get(db, "tags", TagWithId, {"_id": t}, one=True) for t in tags]
    for t in tags: t.name = await get_tag_name(t, db)
    tags = sorted(tags, key=lambda t: not t.name.startswith("Wyjazdy"))
    return [str(t.id) for t in tags]


async def get_rich_tag(tag: Tag | str, db: AsyncIOMotorDatabase) -> TagRichWithId:
    if isinstance(tag, str): tag = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    tag.name = await get_tag_name(tag, db)
    return TagRichWithId(_id=str(tag.id), name=tag.name, colour=tag.colour)


async def get_rich_tags(tags: list[str], db: AsyncIOMotorDatabase) -> list[TagRichWithId]:
    tags = list(set(tags))
    return [await get_rich_tag(t, db) for t in tags]


async def create_tags_condition(
    tagsIn: list[str] | None,
    tagsOut: list[str] | None,
    tagsInJoin: Join,
    tagsOutJoin: Join,
    db: AsyncIOMotorDatabase
) -> dict:
    condition = {}
    # include tags and subtags
    includeTags = {}
    for t in tagsIn or []:
        includeTags[t] = await get_all_tag_children_ids(t, db)
    # exclude tags and subtags
    excludeTags = {}
    for t in tagsOut or []:
        excludeTags[t] = await get_all_tag_children_ids(t, db)
    # fix overlap
    excludeTags = {k: [vi for vi in v if vi not in includeTags.keys()] for k, v in excludeTags.items()}
    includeTags = {k: [vi for vi in v if vi not in excludeTags.keys()] for k, v in includeTags.items()}
    # build tag conditions
    condition["tags"] = {}
    if len(includeTags) > 0:
        if tagsInJoin == Join.OR:
            condition["tags"]["$in"] = [x for k, v in includeTags.items() for x in (k, *v)]
        if tagsInJoin == Join.AND:
            condition["$and"] = [{"tags": {"$in": [k, *v]}} for k, v in includeTags.items()]
    if len(excludeTags) > 0:
        if tagsOutJoin == Join.OR:
            condition["tags"]["$nin"] = [x for k, v in excludeTags.items() for x in (k, *v)]
        if tagsOutJoin == Join.AND:
            condition["$nor"] = [{"$and": [{"tags": {"$in": [k, *v]}} for k, v in excludeTags.items()]}]
    if len(condition["tags"]) == 0:
        del condition["tags"]
    return condition
