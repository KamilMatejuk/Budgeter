import { ColumnDef } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    wrap?: boolean;
    ellipsis?: boolean;
  }
}
