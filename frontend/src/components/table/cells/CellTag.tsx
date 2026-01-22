import { useRichTag } from "@/app/api/query";
import { TagRichWithId, TagWithId } from "@/types/backend";
import { ColumnDef } from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";


const classes = {
  container: "flex",
  base: "whitespace-nowrap m-0 ml-[-8px] px-3 py-0.5 text-sm",
  first: "ml-0 pl-2 rounded-l",
  last: "pr-2 rounded-r",
  polygon: {
    base: "[clip-path:polygon(10px_0%,100%_0%,calc(100%-10px)_100%,0%_100%)]",
    first: "[clip-path:polygon(0%_0%,100%_0%,calc(100%-10px)_100%,0%_100%)]",
    last: "[clip-path:polygon(10px_0%,100%_0%,100%_100%,0%_100%)]",
  }
}

export function getTextColor(bgColor: string): string {
  // Calculate the brightness of the background color
  if (bgColor === "transparent") return "black"
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "black" : "white";
}

interface CellTagIdProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function CellTagId({ id, ...props }: CellTagIdProps) {
  const tag = useRichTag(id) || { _id: id, name: id, colour: 'transparent' };
  return <CellTag tag={tag} {...props} />;
}

interface CellTagProps extends React.HTMLAttributes<HTMLDivElement> {
  tag: TagRichWithId;
}

export function CellTag({ tag, ...props }: CellTagProps) {
  const parts = tag.name.split("/");
  return <div className={classes.container} {...props}>
    {parts.map((part, i) => {
      const isFirst = i == 0;
      const isLast = i == parts.length - 1;
      const isOnly = isFirst && isLast;
      return (
        <span
          key={i}
          className={twMerge(
            classes.base,
            isFirst && classes.first,
            isLast && classes.last,
            !isOnly && classes.polygon.base,
            !isOnly && isFirst && classes.polygon.first,
            !isOnly && isLast && classes.polygon.last,
          )}
          style={{
            backgroundColor: part == "Other" ? `${tag.colour}88` : tag.colour,
            color: getTextColor(tag.colour),
          }}
        >
          {part}
        </span>
      )
    })}
  </div>
}

export function defineCellTag<T extends { tag?: TagRichWithId, tags?: TagRichWithId[] }>() {
  return {
    accessorKey: "tags", header: "Tags", cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.tags?.map((t) => <CellTag key={t._id} tag={t} />)}
        {row.original.tag ? <CellTag tag={row.original.tag} /> : null}
      </div>
    ), meta: { wrap: true }
  } as ColumnDef<T>;
}
