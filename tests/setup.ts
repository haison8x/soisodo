import '@testing-library/jest-native/extend-expect';

// Suppress React act(...) warnings in test logs
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('was not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
};

// Mock Expo's winter registry if it causes issues in Node environment
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__ExpoImportMetaRegistry = {
    ImportMetaRegistry: {
      get: (id: string) => ({}),
      set: (id: string, value: any) => {},
    }
  };
  // Mock structuredClone to avoid expo polyfill issues
  if (!(globalThis as any).structuredClone) {
    (globalThis as any).structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
  }
}

jest.mock('@ungap/structured-clone', () => ({
  default: (val: any) => JSON.parse(JSON.stringify(val)),
}));


jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy({}, {
    get: (target, prop) => {
      return (props: any) => React.createElement(View, props);
    }
  });
});

jest.mock('expo-haptics');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'soitoadovn',
    slug: 'soitoadovn',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
  clear: jest.fn(async () => {}),
  mergeItem: jest.fn(async () => {}),
  multiGet: jest.fn(async () => []),
  multiSet: jest.fn(async () => {}),
  multiRemove: jest.fn(async () => {}),
  multiMerge: jest.fn(async () => {}),
  getAllKeys: jest.fn(async () => []),
}));

