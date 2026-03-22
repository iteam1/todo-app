'use client';

import type { ReactNode } from 'react';

interface ClientRootProps {
  children: ReactNode;
}

export default function ClientRoot({ children }: ClientRootProps) {
  return <>{children}</>;
}
