import re
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId  # Reuse ObjectId validator
from pydantic import validator

TAG_PATTERN = re.compile(r"^[a-z0-9]+(\/[a-z0-9]+){0,2}$")  # max 3 poziomy

class Transaction(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    date: datetime
    title: str
    shop: Optional[str] = None
    value: float
    tags: List[str]  # np. ["food", "food/shop", "food/junk"]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    @validator("tags", each_item=True)
    def validate_tag(cls, tag):
        if not TAG_PATTERN.match(tag):
            raise ValueError("Invalid tag format. Use lowercase and up to 3 levels (e.g. 'food/shop')")
        return tag
