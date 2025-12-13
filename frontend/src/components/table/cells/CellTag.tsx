import { get } from "@/app/api/fetch";
import { TagWithId } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";


interface CellTagProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
}

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
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "black" : "white";
}

export function getTagParts(tagId: string, tags: TagWithId[]): { name: string, colour: string }[] {
  const tag = tags.find(t => t._id === tagId);
  if (!tag) return [];
  const curr = { name: tag.name, colour: tag.colour };
  const parents = tag.parent ? getTagParts(tag.parent, tags) : [];
  return [...parents, curr];
}


export default function CellTag({ id, ...props }: CellTagProps) {
  const { data: tags } = useQuery({
    queryKey: ["tag"],
    queryFn: async () => {
      const { response } = await get<TagWithId[]>("/api/tag", ["tag"]);
      return response;
    },
  });
  const tagParts = getTagParts(id, tags || []);

  return tagParts.length == 0 ? null : (
    <div className={classes.container} {...props}>
      {tagParts.map((part, i) => {
        const isFirst = i == 0;
        const isLast = i == tagParts.length - 1;
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
              backgroundColor: part.colour,
              color: getTextColor(part.colour),
            }}
          >
            {part.name}
          </span>
        )
      })}
    </div>
  );
}
