import { useQuery } from '@tanstack/react-query';

export interface Metadata {
  segments: string[];
  countries: string[];
  currencies: string[];
}

export function useMetadata() {
  return useQuery<Metadata>({
    queryKey: ['metadata'],
    queryFn: async () => {
      const res = await fetch('/api/metadata');
      if (!res.ok) throw new Error('Failed to fetch metadata');
      return res.json();
    },
    staleTime: Infinity, // Metadata changes very rarely
  });
}
