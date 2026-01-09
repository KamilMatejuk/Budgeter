import { ColumnDef } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    wrap?: boolean; // wrap on white space
    wrapForce?: boolean; // force wrap on any character
    ellipsis?: boolean;
    align?: "left" | "center" | "right";
    border?: "left" | "right" | "both";
  }
}
