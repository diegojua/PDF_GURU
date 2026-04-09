import * as SecureStore from 'expo-secure-store';

const secureKey = (key: string, tenantId?: string) => (tenantId ? `${tenantId}:${key}` : key);
const TENANT_SELECTION_KEY = 'selectedTenantId';

export const SecureStorage = {
  setItem: async (key: string, value: string, tenantId?: string) => {
    const storageKey = secureKey(key, tenantId);
    await SecureStore.setItemAsync(storageKey, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  },

  getItem: async (key: string, tenantId?: string) => {
    const storageKey = secureKey(key, tenantId);
    return SecureStore.getItemAsync(storageKey);
  },

  deleteItem: async (key: string, tenantId?: string) => {
    const storageKey = secureKey(key, tenantId);
    await SecureStore.deleteItemAsync(storageKey);
  },

  setSelectedTenantId: async (tenantId: string) => {
    await SecureStore.setItemAsync(TENANT_SELECTION_KEY, tenantId, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  },

  getSelectedTenantId: async () => {
    return SecureStore.getItemAsync(TENANT_SELECTION_KEY);
  },

  deleteSelectedTenantId: async () => {
    await SecureStore.deleteItemAsync(TENANT_SELECTION_KEY);
  },
};
