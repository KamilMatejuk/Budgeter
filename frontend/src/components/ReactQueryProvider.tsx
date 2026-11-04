"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

function InvalidateOnNavigation({ queryClient }: { queryClient: QueryClient }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    queryClient.invalidateQueries();
  }, [pathname, queryClient]);
  return null;
}

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <InvalidateOnNavigation queryClient={queryClient} />
      {children}
    </QueryClientProvider>
  );
}
