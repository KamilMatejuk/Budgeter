'use client';

import MultiColumnSection from "../page_layout/MultiColumnSection";
import Table, { Item, TableProps } from "./Table";

interface MultiColumnTableProps<T extends Item> extends TableProps<T> {
  n: number;
}

export default function MultiColumnTable<T extends Item>({ n, data, CreateModal, expandChild, ...props }: MultiColumnTableProps<T>) {
  // cannot use multi-column layout with less than 2 columns
  if (n <= 1) return <Table<T> {...props} data={data} CreateModal={CreateModal} expandChild={expandChild} />;
  // cannot use multi-column layout with expandable rows
  if (expandChild) return <Table<T> {...props} data={data} CreateModal={CreateModal} expandChild={expandChild} />;
  // split data into n roughly equal parts
  const chunkSize = Math.ceil((data.length + (CreateModal ? 1 : 0)) / n);
  const dataChunks: T[][] = [];
  for (let i = 0; i < n; i++) {
    dataChunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  // render multi-column section with tables
  return (
    <MultiColumnSection className="gap-1">
      {dataChunks.map((chunk, i) => (
        <Table<T> {...props} data={chunk} CreateModal={i == dataChunks.length - 1 ? CreateModal : undefined} />
      ))}
    </MultiColumnSection>
  );
}
