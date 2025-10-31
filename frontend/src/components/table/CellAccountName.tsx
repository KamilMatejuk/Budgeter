import { get } from "@/app/api/fetch";
import { PersonalAccountWithId } from "@/types/backend";
import { useEffect, useState } from "react";

export interface CellAccountNameProps {
  id: string;
}

export default function CellAccountName({ id }: CellAccountNameProps) {
  const [account, setAccount] = useState<string>(id);
  useEffect(() => {
    get<PersonalAccountWithId>(`/api/products/personal_account/${id}`, ["personal_account"])
      .then(({ response }) => response && setAccount(response.name));
  }, [id]);

  return (<p>{account}</p>);
}
