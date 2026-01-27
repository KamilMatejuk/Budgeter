import os
import glob
from datetime import datetime

from bson import BSON
from bson.errors import InvalidBSON
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from routes.base import fail_wrapper
from models.base import PyObjectId
from models.backup import BackupRequest, BackupPatchRequest, BackupResponse


BACKUP_EXT = ".bson"
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "../backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

router = APIRouter()

### Read parameters from filename and vice versa ###

def _get_filename(name: str, auto: bool) -> str:
    """('test', True) -> 'auto_test.bson'"""
    name = ("auto_" if auto else "manual_") + name.lower().replace(" ", "_") + BACKUP_EXT
    return os.path.join(BACKUP_DIR, name)

def _get_name(filename: str) -> str:
    """('auto_test.bson') -> 'Test'"""
    return os.path.basename(filename).replace(BACKUP_EXT, "").replace("_", " ").split(" ", 1)[-1].capitalize()

def _get_auto(filename: str) -> bool:
    """('auto_test.bson') -> True"""
    return os.path.basename(filename).startswith("auto_")

def _find_unique_name(name: str) -> str:
    """Find unique backup name by appending counter if needed"""
    existing_files = glob.glob(os.path.join(BACKUP_DIR, f"[auto|manual]*{BACKUP_EXT}"))
    existing_names = {_get_name(f).lower() for f in existing_files}
    candidate = name
    counter = 2
    while candidate.lower() in existing_names:
        candidate = f"{name} {counter}"
        counter += 1
    return candidate

def _find_file(name: str) -> str:
    """Find existing backup file by name"""
    existing_files = glob.glob(os.path.join(BACKUP_DIR, f"[auto|manual]*{BACKUP_EXT}"))
    existing_names = {_get_name(f).lower(): f for f in existing_files}
    file = existing_names.get(name.lower())
    assert file is not None, "Backup not found"
    return file

### Read .bson backup file ###

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

### Parse .bson file info ###

def _parse_file_info(filename: str) -> BackupResponse:
    cols = {}
    for coll_name, _ in _read(filename):
        cols[coll_name] = cols.get(coll_name, 0) + 1
    stat = os.stat(filename)
    return BackupResponse(
        _id=str(PyObjectId()),
        name=_get_name(filename),
        auto=_get_auto(filename),
        timestamp=datetime.fromtimestamp(stat.st_mtime),
        size_mb=stat.st_size / (1024 * 1024),
        description=", ".join(f"{k}: {v}" for k, v in sorted(cols.items(), key=lambda x: x[0])),
    )

### Routes ###

@router.get("", response_model=list[BackupResponse])
async def get_backups():
    @fail_wrapper
    async def inner():
        response = []
        files = glob.glob(os.path.join(BACKUP_DIR, f"*{BACKUP_EXT}"))
        files = sorted(files, key=os.path.getmtime, reverse=True)
        for f in files:
            response.append(_parse_file_info(f))
        return response
    return await inner()


@router.post("", response_model=BackupResponse)
async def create_backup(data: BackupRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        name = _find_unique_name(data.name)
        filename = _get_filename(name, data.auto)
        collections = await db.list_collection_names()
        with open(filename, "wb") as f:
            for coll_name in collections:
                cursor = db[coll_name].find({})
                async for doc in cursor:
                    doc["__collection"] = coll_name
                    bson_doc = BSON.encode(doc)
                    f.write(bson_doc)
        return _parse_file_info(filename)
    return await inner()


@router.patch("", response_model=BackupResponse)
async def update_backup(data: BackupPatchRequest):
    @fail_wrapper
    async def inner():
        filename = _find_file(data.prev_name)
        auto = _get_auto(filename)
        new_name = _find_unique_name(data.name)
        new_filename = _get_filename(new_name, auto)
        # preserve timestamp
        stat = os.stat(filename)
        os.rename(filename, new_filename)
        os.utime(new_filename, (stat.st_atime, stat.st_mtime))
        return _parse_file_info(new_filename)
    return await inner()


@router.post("/restore/{name}", response_model=dict)
async def restore_backup(name: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        filename = _find_file(name)
        # clean collections
        collections = await db.list_collection_names()
        for coll in collections:
            await db[coll].delete_many({})
        # restore from backup
        for coll_name, doc in _read(filename):
            await db[coll_name].insert_one(doc)
        return {}
    return await inner()

@router.delete("/{name}", response_model=dict)
async def delete_backup(name: str):
    @fail_wrapper
    async def inner():
        filename = _find_file(name)
        os.remove(filename)
        return {}
    return await inner()