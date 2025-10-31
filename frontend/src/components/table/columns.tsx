import { ColumnDef } from "@tanstack/react-table";
import { ItemID } from "./Table";
import { CardWithId, PersonalAccountWithId, Transaction } from "@/types/backend";
import CellValue from "./CellValue";
import CellBoolean from "./CellBoolean";
import CellTextWrap from "./CellTextWrap";
import CellAccountName from "./CellAccountName";

const selectColumn: ColumnDef<ItemID> = {
    id: "select",
    header: ({ table }) => (
        <input
            type="checkbox"
            checked={table.getIsAllRowsSelected?.() ?? false}
            onChange={table.getToggleAllRowsSelectedHandler?.()}
        />
    ),
    cell: ({ row }) => (
        <input
            type="checkbox"
            checked={row.getIsSelected?.() ?? false}
            onChange={row.getToggleSelectedHandler?.()}
        />
    ),
};

const settingsColumns = {
    name: {
        accessorKey: "name",
        header: "Name"
    },
    value: {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => <CellValue value={row.original.value} />,
    } as ColumnDef<PersonalAccountWithId>,
    currency: {
        accessorKey: "currency",
        header: "Currency"
    },
    number: {
        accessorKey: "number",
        header: "Number"
    },
    credit: {
        accessorKey: "credit",
        header: "Credit",
        cell: ({ row }) => <CellBoolean value={row.original.credit} />,
    } as ColumnDef<CardWithId>,
    account: {
        accessorKey: "account",
        header: "Account",
        cell: ({ row }) => <CellAccountName id={row.original.account} />,
    } as ColumnDef<CardWithId>,
    minTransactionsMonthly: {
        accessorKey: "min_number_of_transactions_monthly",
        header: "Minimal Transactions Monthly"
    },
    minAmountMonthly: {
        accessorKey: "min_incoming_amount_monthly",
        header: "Minimal Incoming/Outgoing Monthly",
        cell: ({ row }) => {
            const incoming = row.original.min_incoming_amount_monthly;
            const outgoing = row.original.min_outgoing_amount_monthly;
            return `${incoming} / ${outgoing}`;
        }
    } as ColumnDef<PersonalAccountWithId>,
    interest: {
        accessorKey: "yearly_interest",
        header: "Yearly Interest"
    },
    capitalization: {
        accessorKey: "capitalization",
        header: "Capitalization"
    },
    startDate: {
        accessorKey: "start",
        header: "Start Date"
    },
    endDate: {
        accessorKey: "end",
        header: "End Date"
    },
    dayOfMonth: {
        accessorKey: "day_of_month",
        header: "Day of Month"
    },
}

const transactionsColumns = {
    date: {
        accessorKey: "date",
        header: "Date"
    },
    title: {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <CellTextWrap value={row.original.title} />,
    } as ColumnDef<Transaction>,
    organisation: {
        accessorKey: "organisation",
        header: "Organisation",
        cell: ({ row }) => <CellTextWrap value={row.original.organisation} />,
    } as ColumnDef<Transaction>,
    diffValue: {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => <CellValue value={row.original.value} as_diff />,
    } as ColumnDef<Transaction>,
    tags: {
        accessorKey: "tags",
        header: "Tags"
    },
}

export const COLUMNS = {
    select: selectColumn,
    ...settingsColumns,
    ...transactionsColumns,
};
