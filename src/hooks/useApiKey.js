import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import { getApiKey, setApiKey, clearApiKey, subscribeApiKey, apiKeySource } from '../config/apiKeyStore';

export const useApiKey = () => {
  const key = useSyncExternalStore(subscribeApiKey, getApiKey, getApiKey);

  const source = apiKeySource();

  const updateKey = useCallback((value, options) => {
    setApiKey(value, options);
  }, []);

  const removeKey = useCallback(() => {
    clearApiKey();
  }, []);

  return {
    apiKey: key,
    source,
    setApiKey: updateKey,
    clearApiKey: removeKey,
  };
};
