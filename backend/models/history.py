from models.base import PyBaseModel

class CardMonthlyHistory(PyBaseModel):
    year: int
    month: int
    card: str # id of Card
    transactions: int
