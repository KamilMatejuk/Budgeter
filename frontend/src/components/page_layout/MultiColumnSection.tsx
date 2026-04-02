import React, { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import ScrollableHorizontal from "../ScrollableHorizontal";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement>, PropsWithChildren {
  mobileBehaviour: 'wrap' | 'scroll';
}

export default function MultiColumnSection({ children, mobileBehaviour, ...props }: SectionHeaderProps) {
  const n = children ? (Array.isArray(children) ? children.length : 1) : 0;

  if (n == 0) return null;
  if (n == 1) return children;

  const gridContent = (children as React.ReactNode[]).flatMap((child, i) => (
    <React.Fragment key={i}>
      {i > 0 && <div className="bg-second-bg" />}
      <div>{child}</div>
    </React.Fragment>
  ));
  const gridStyle = { gridTemplateColumns: new Array(n).fill("1fr").join(" 1px ") };

  const gridClassName = mobileBehaviour === 'scroll'
    ? "w-full grid gap-4"
    : "w-full hidden sm:grid gap-4";

  return (
    <>
      {/* one after another - mobile wrap */}
      {mobileBehaviour === 'wrap' && (
        <div
          {...props}
          className={twMerge("w-full flex flex-col gap-4 sm:hidden", props.className)}
        >
          {(children as React.ReactNode[]).map((child, i) => (
            <div key={i}>{child}</div>
          ))}
        </div>
      )}
      {/* each one next to each other - desktop or mobile scroll*/}
      <ScrollableHorizontal>
        <div
          {...props}
          className={twMerge(gridClassName, props.className)}
          style={gridStyle}
          >
          {gridContent}
        </div>
      </ScrollableHorizontal>
    </>
  );
}
