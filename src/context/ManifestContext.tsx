import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ManifestData } from '../types/curriculum';

interface ManifestContextValue {
  manifest: ManifestData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const ManifestContext = createContext<ManifestContextValue | null>(null);

export const ManifestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/data/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ManifestData>;
      })
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load curriculum manifest');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ManifestContext.Provider value={{ manifest, loading, error, reload: load }}>
      {children}
    </ManifestContext.Provider>
  );
};

export function useManifest(): ManifestContextValue {
  const ctx = useContext(ManifestContext);
  if (!ctx) throw new Error('useManifest must be used inside ManifestProvider');
  return ctx;
}
