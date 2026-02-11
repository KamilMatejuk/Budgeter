import Link from "next/link";
import { Range } from "./MonthSelector";
import { getDateString, getISODateString } from "@/const/date";
import { Comparison, ComparisonItemRecursive } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellTag } from "@/components/table/cells/CellTag";
import { defineCellValue } from "@/components/table/cells/CellValue";
import SectionHeader from "@/components/page_layout/SectionHeader";
import React from "react";
import { PieChart } from "@/components/dashboard/Chart";
import InfoToast from "@/components/toast/InfoToast";
import { FaExternalLinkAlt } from "react-icons/fa";
import { getTagsSearchSlug } from "../search/utils";
import { useRichTags } from "../api/query";

export interface DetailProps extends Omit<Comparison, "month" | "year"> {
  range: Range;
  slug: string;
}

const columns: ColumnDef<ComparisonItemRecursive>[] = [
  defineCellTag<ComparisonItemRecursive>(),
  defineCellValue<ComparisonItemRecursive>(true),
];

const classes = {
  label: "text-sm text-subtext mt-4",
  value: "text-2xl font-semibold",
  switch: "text-sm text-subtext underline cursor-pointer mt-2 w-full",
  graphContainer: "flex justify-center items-center gap-4",
}

function removeZeros(items: ComparisonItemRecursive[]): ComparisonItemRecursive[] {
  return items
    .filter(i => i.value_pln !== 0)
    .map(i => ({
      ...i,
      children: removeZeros(i.children),
    }));
}

const Detail = React.memo(function Detail({ value_pln, transactions, range, slug, children_tags, other_tags }: DetailProps) {
  const allTags = useRichTags();
  const [hideZeros, setHideZeros] = React.useState(false);
  const childrenTagValues = hideZeros ? removeZeros(children_tags) : children_tags;

  const dateStart = new Date(range.startYear, range.startMonth - 1, 1);
  const dateEnd = new Date(range.endYear, range.endMonth, 0);

  const allTransactionsUrl = `/search?${slug}&dateStart=${getISODateString(dateStart)}&dateEnd=${getISODateString(dateEnd)}`;

  const columnsWithLink = React.useMemo(() => ([
    ...columns,
    {
      header: "",
      accessorKey: "link",
      cell: ({ row }) => <Link target="_blank" className="text-subtext"
        href={`${allTransactionsUrl}&${getTagsSearchSlug(row.original.tag, allTags)}&tagsInJoin=AND`}>
        <FaExternalLinkAlt size={12} />
      </Link>
    }
  ]), [allTransactionsUrl, allTags]);

  return (
    <div className="flex flex-col items-center">
      <SectionHeader text={`${getDateString(dateStart)} - ${getDateString(dateEnd)}`} className="border-b border-line" />

      <p className={classes.label}>Total value</p>
      <p className={classes.value}>{value_pln.toFixed(2)} zł</p>

      <p className={classes.label}>Number of transactions</p>
      <Link target="_blank" href={allTransactionsUrl}>
        <p className={classes.value}>{transactions}</p>
      </Link>

      <SectionHeader text="Children composition" className="border-b border-line text-md font-normal" />

      <div className={classes.graphContainer}>
        {children_tags.map((child, i) => {
          // filter out zero value items and get first non-single children level
          let items = child.children.filter(c => c.value_pln !== 0);
          while (items.length === 1) {
            const itemChildren = items[0].children.filter(c => c.value_pln !== 0);
            if (itemChildren.length === 0) break;
            items = items[0].children.filter(c => c.value_pln !== 0)
          };
          return items.length == 0
            ? <InfoToast key={i} message="No subtags found" />
            : <PieChart
              key={i}
              data={items.map(c => c.value_pln)}
              labels={items.map(c => c.tag.name)}
              colors={items.map(c => c.tag.colour)}
              width="200px"
              height="200px"
            />
        })}
      </div>

      {(childrenTagValues.length == 1 ? childrenTagValues[0].children : childrenTagValues).length > 0 && (<div>
        <p className={classes.switch} onClick={() => setHideZeros(!hideZeros)}>{hideZeros ? "Show empty" : "Hide empty"}</p>
        <Table<ComparisonItemRecursive>
          data={childrenTagValues.length == 1 ? childrenTagValues[0].children : childrenTagValues} // show only children if only one tag selected
          columns={columnsWithLink}
          expandChild="children"
          expandAll
        />
      </div>)}

      <SectionHeader text="Other tags composition" className="border-b border-line text-md font-normal" />

      <div className={classes.graphContainer}>
        {other_tags.map((child, i) => {
          return child.children.length == 0
            ? <InfoToast key={i} message="No other tags found" />
            : <PieChart
              key={i}
              data={child.children.map(c => c.value_pln)}
              labels={child.children.map(c => c.tag.name)}
              colors={child.children.map(c => c.tag.colour)}
              width="200px"
              height="200px"
            />
        })}
      </div>

      {(other_tags.length == 1 ? other_tags[0].children : other_tags).length > 0 && (
        <Table<ComparisonItemRecursive>
          data={other_tags.length == 1 ? other_tags[0].children : other_tags} // show only children if only one tag selected
          columns={columnsWithLink}
          expandChild="children"
        />
      )}
    </div>
  );
});
export default Detail;
