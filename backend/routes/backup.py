import os
import glob
import hashlib
from datetime import datetime

from bson import BSON
from bson.errors import InvalidBSON
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from routes.base import fail_wrapper
from models.base import PyBaseModel, WithId, PyObjectId


BACKUP_EXT = ".bson"
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "../backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

router = APIRouter()


class BackupRequest(PyBaseModel):
    name: str

class BackupResponse(PyBaseModel, metaclass=WithId):
    name: str
    timestamp: datetime
    size_mb: float
    description: str


def _name_to_filename(name: str) -> str:
    return os.path.join(BACKUP_DIR, name.lower().replace(" ", "_") + BACKUP_EXT)

def _filename_to_name(filename: str) -> str:
    return os.path.basename(filename).replace(BACKUP_EXT, "").replace("_", " ").title()

def _read(filename: str):
    with open(filename, "rb") as f:
        while True:
            header = f.read(4)
            if not header or len(header) < 4: return  # EOF cleanly reached
            size = int.from_bytes(header, "little")
            doc_bytes = header + f.read(size - 4)
            if len(doc_bytes) < size: return  # incomplete doc
            try: doc = BSON(doc_bytes).decode()
            except InvalidBSON: return  # corrupted or EOF
            coll_name = doc.pop("__collection", None)
            if coll_name is None: continue  # malformed doc
            yield coll_name, doc

def _parse_file_info(filename: str) -> BackupResponse:
    stat = os.stat(filename)
    with open(filename, "rb") as f:
        hash = hashlib.sha256(f.read()).hexdigest()[:24]
    cols = {}
    for coll_name, _ in _read(filename):
        cols[coll_name] = cols.get(coll_name, 0) + 1
    return {
        "_id": hash,
        "name": _filename_to_name(filename),
        "timestamp": datetime.fromtimestamp(stat.st_mtime),
        "size_mb": stat.st_size / (1024 * 1024),
        "description": ", ".join(f"{k}: {v}" for k, v in sorted(cols.items(), key=lambda x: x[0])),
    }

def _find_unique_name(name: str) -> str:
    existing_files = glob.glob(os.path.join(BACKUP_DIR, f"*{BACKUP_EXT}"))
    existing_names = {_filename_to_name(f).lower() for f in existing_files}
    candidate = name
    counter = 2
    while candidate.lower() in existing_names:
        candidate = f"{name} {counter}"
        counter += 1
    return candidate


@router.get("", response_model=list[BackupResponse])
async def get_backups():
    @fail_wrapper
    async def inner():
        response = []
        for f in glob.glob(os.path.join(BACKUP_DIR, f"*{BACKUP_EXT}")):
            response.append(BackupResponse(**_parse_file_info(f)))
        return response
    return await inner()


@router.post("", response_model=BackupResponse)
async def create_backup(data: BackupRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        name = _find_unique_name(data.name)
        filename = _name_to_filename(name)
        collections = await db.list_collection_names()
        with open(filename, "wb") as f:
            for coll_name in collections:
                cursor = db[coll_name].find({})
                async for doc in cursor:
                    doc["__collection"] = coll_name
                    bson_doc = BSON.encode(doc)
                    f.write(bson_doc)
        return BackupResponse(**_parse_file_info(filename))
    return await inner()


@router.post("/restore/{name}", response_model=dict)
async def restore_backup(name: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        filename = _name_to_filename(name)
        # clean collections
        collections = await db.list_collection_names()
        for coll in collections:
            await db[coll].delete_many({})
        # restore from backup
        async for coll_name, doc in _read(filename):
            await db[coll_name].insert_one(doc)
        return {}
    return await inner()

@router.delete("/{name}", response_model=dict)
async def delete_backup(name: str):
    @fail_wrapper
    async def inner():
        filename = _name_to_filename(name)
        os.remove(filename)
        return {}
    return await inner()