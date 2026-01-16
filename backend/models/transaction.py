from datetime import date

from models.base import PyBaseModel, Partial, WithId
from models.products import Currency, PersonalAccountWithId, CashWithId
from models.organisation import OrganisationWithId
from models.tag import TagRichWithId

class Transaction(PyBaseModel):
    account: str # id of PersonalAccount or Cash
    date: date
    title: str
    organisation: str
    value: float
    currency: Currency
    tags: list[str] # ids of Tags
    cash: bool = False # account id is Cash or PersonalAccount
    deleted: bool = False
    debt_person: str | None = None # name of person that has to repay it


class TransactionPartial(Transaction, metaclass=Partial): pass
class TransactionWithId(Transaction, metaclass=WithId): pass

class TransactionRich(Transaction):
    organisation: OrganisationWithId
    account: PersonalAccountWithId | CashWithId
    tags: list[TagRichWithId]
class TransactionRichWithId(TransactionRich, metaclass=WithId): pass

# split

class TransactionSplitRequestItem(PyBaseModel):
    title: str
    value: float

class TransactionSplitRequest(PyBaseModel):
    items: list[TransactionSplitRequestItem]


# repay dept

class TransactionRepayRequest(PyBaseModel):
    debt_transaction_id: str # id of Transaction
