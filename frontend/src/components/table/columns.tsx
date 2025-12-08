import { ColumnDef } from "@tanstack/react-table";
import { ItemID } from "./Table";
import { BackupResponse, CapitalInvestmentWithId, CardWithId, OrganisationWithId, PersonalAccountWithId, Transaction } from "@/types/backend";
import CellValue from "./cells/CellValue";
import CellBoolean from "./cells/CellBoolean";
import CellTextWrap from "./cells/CellTextWrap";
import CellAccountName from "./cells/CellAccountName";
import CellOrganisation from "./cells/CellOrganisation";
import CellIcon from "./cells/CellIcon";
import { Currency } from "@/types/enum";

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
        cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} />,
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
    active: {
        accessorKey: "active",
        header: "Active",
        cell: ({ row }) => <CellBoolean value={row.original.active} />,
    } as ColumnDef<CardWithId>,
    account: {
        accessorKey: "account",
        header: "Account",
        cell: ({ row }) => <CellAccountName id={row.original.account} />,
    } as ColumnDef<CardWithId>,
    minTransactionsMonthly: {
        accessorKey: "min_number_of_transactions_monthly",
        header: "Requirements",
        cell: ({ row }) => {
            const amount = row.original.min_number_of_transactions_monthly;
            return amount ? `${amount} transactions` : "None";
        }
    } as ColumnDef<CardWithId>,
    minAmountMonthly: {
        accessorKey: "min_incoming_amount_monthly",
        header: "Requirements",
        cell: ({ row }) => {
            const incoming = row.original.min_incoming_amount_monthly;
            const outgoing = row.original.min_outgoing_amount_monthly;
            return [
                incoming ? `${incoming.toFixed(2)} incoming` : null,
                outgoing ? `${outgoing.toFixed(2)} outgoing` : null,
            ].filter(Boolean).join(", ") || "None";
        }
    } as ColumnDef<PersonalAccountWithId>,
    interest: {
        accessorKey: "yearly_interest",
        header: "Yearly Interest",
        cell: ({ row }) => row.original.yearly_interest.toFixed(1) + "%",
    } as ColumnDef<CapitalInvestmentWithId>,
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
    pattern: {
        accessorKey: "pattern",
        header: "Pattern"
    },
    icon: {
        accessorKey: "icon",
        header: "Icon",
        cell: ({ row }) => <CellIcon source={row.original.icon || ""} alt={row.original.name} />,
    } as ColumnDef<OrganisationWithId>,
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
        cell: ({ row }) => <CellOrganisation name={row.original.organisation} />,
    } as ColumnDef<Transaction>,
    diffValue: {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => <CellValue value={row.original.value} currency={Currency.PLN} colour />,
    } as ColumnDef<Transaction>,
    tags: {
        accessorKey: "tags",
        header: "Tags"
    },
}

const backupColumns = {
    timestamp: {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => new Date(row.original.timestamp).toLocaleString('pl-PL'),
    } as ColumnDef<BackupResponse>,
    size_mb: {
        accessorKey: "size_mb",
        header: "Size",
        cell: ({ row }) => row.original.size_mb.toFixed(2) + " MB",
    } as ColumnDef<BackupResponse>,
    description: {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <CellTextWrap value={row.original.description} />,
    } as ColumnDef<BackupResponse>,
};

export const COLUMNS = {
    select: selectColumn,
    ...settingsColumns,
    ...transactionsColumns,
    ...backupColumns,
};
