import React, { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement>, PropsWithChildren { }

export default function MultiColumnSection({ children, ...props }: SectionHeaderProps) {
  const n = children ? (Array.isArray(children) ? children.length : 1) : 0;

  if (n == 0) return null;
  if (n == 1) return children;

  return (
    <>
      <div
        {...props}
        className={twMerge("w-full flex flex-col gap-4 sm:hidden", props.className)}
      >
        {(children as React.ReactNode[]).map((child, i) => (
          <div key={i}>{child}</div>
        ))}
      </div>
      <div
        {...props}
        className={twMerge("w-full hidden sm:grid gap-4", props.className)}
        style={{ gridTemplateColumns: new Array(n).fill("1fr").join(" 1px ") }}
      >
        {(children as React.ReactNode[]).flatMap((child, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="bg-second-bg" />}
            <div>{child}</div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
