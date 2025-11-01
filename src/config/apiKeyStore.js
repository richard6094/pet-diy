const STORAGE_KEY = 'pet-tshirt-google-api-key';

const listeners = new Set();
let memoryKey = undefined;

const getEnvApiKey = () => {
  const envKey = import.meta.env?.VITE_GOOGLE_API_KEY;
  return typeof envKey === 'string' && envKey.trim() ? envKey.trim() : undefined;
};

const readPersistedKey = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && stored.trim() ? stored.trim() : undefined;
  } catch (error) {
    console.warn('[apiKeyStore] 读取本地存储失败:', error);
    return undefined;
  }
};

const writePersistedKey = (value) => {
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('[apiKeyStore] 写入本地存储失败:', error);
  }
};

const notify = () => {
  listeners.forEach((listener) => listener(getApiKey()));
};

export const getApiKey = () => {
  const envKey = getEnvApiKey();
  if (envKey) return envKey;
  if (memoryKey) return memoryKey;
  return typeof window !== 'undefined' ? readPersistedKey() : undefined;
};

export const setApiKey = (value, { persist = true } = {}) => {
  memoryKey = value?.trim() || undefined;
  if (persist && typeof window !== 'undefined') {
    writePersistedKey(memoryKey);
  }
  notify();
};

export const clearApiKey = () => {
  memoryKey = undefined;
  if (typeof window !== 'undefined') {
    writePersistedKey(undefined);
  }
  notify();
};

export const subscribeApiKey = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const apiKeySource = () => {
  if (getEnvApiKey()) return 'env';
  if (memoryKey) return 'memory';
  if (typeof window !== 'undefined' && readPersistedKey()) return 'storage';
  return 'none';
};
