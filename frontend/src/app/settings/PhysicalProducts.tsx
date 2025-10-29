import { get } from "../api/fetch";
import { Card, CardWithId, Cash, CashWithId, PersonalAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function PhysicalProducts() {
  const { response: cash, error: cashError } = await get<CashWithId[]>("/api/products/cash", ["cash"]);
  const { response: cards, error: cardsError } = await get<CardWithId[]>("/api/products/card", ["card"]);
  const { response: accounts } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);

  return (
    <>
      {cashError
        ? <ErrorToast message={`Could not download cash: ${cashError.message}`} />
        : <Table<Cash, CashWithId>
          url="/api/products/cash"
          tag="cash"
          newText="cash"
          data={cash}
          columns={["name", "value", "currency"]} />}
      {cardsError
        ? <ErrorToast message={`Could not download cards: ${cardsError.message}`} />
        : <Table<Card, CardWithId>
          url="/api/products/card"
          tag="card"
          newText="card"
          data={cards.map(card => ({
            ...card,
            account: accounts?.find(acc => acc._id === card.account)?.name || card.account,
          }))}
          columns={["name", "currency", "number", "credit", "account", "minTransactionsMonthly"]} />}
    </>
  );
}
