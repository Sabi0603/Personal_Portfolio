import { useState, useEffect, useCallback, useRef } from 'react';

export const useFetch = (fetchFn, depsOrInitialData = null, initialData = null) => {
  const isDepsArray = Array.isArray(depsOrInitialData);
  const deps = isDepsArray ? depsOrInitialData : [];
  const initData = isDepsArray ? initialData : depsOrInitialData;

  const [data, setData] = useState(initData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (typeof fetchFnRef.current === 'function') {
      fetchFnRef.current()
        .then((result) => {
          if (isMounted) {
            setData(result);
            setError(null);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Failed to fetch data');
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, refetch };
};

