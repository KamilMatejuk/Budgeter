import { FaChevronDown } from "react-icons/fa";
import SectionHeader, { SectionHeaderProps } from "./SectionHeader";
import { PropsWithChildren } from "react";

interface SectionProps extends SectionHeaderProps, PropsWithChildren {
  closed?: boolean;
}

export default function Section({ closed, children, ...props }: SectionProps) {
  return (
    <details open={!closed} className="group">
      <summary className="relative cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden">
        <SectionHeader {...props} />
        <FaChevronDown className="absolute top-1/2 right-1 -translate-y-1/2 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      {children}
    </details>
  );
}
