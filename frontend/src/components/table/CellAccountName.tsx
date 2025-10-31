import { useQuery } from "@tanstack/react-query";
import { get } from "@/app/api/fetch";
import { PersonalAccountWithId } from "@/types/backend";


export interface CellAccountNameProps {
  id: string;
}


export default function CellAccountName({ id }: CellAccountNameProps) {
  const { data: account } = useQuery({
    queryKey: ["personal_account", id],
    queryFn: async () => {
      const { response } = await get<PersonalAccountWithId>(`/api/products/personal_account/${id}`, ["personal_account"]);
      return response;
    },
  });

  return (<p>{account?.name || id}</p>);
}
