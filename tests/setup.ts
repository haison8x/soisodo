import '@testing-library/jest-native/extend-expect';

// Mock Expo's winter registry if it causes issues in Node environment
if (typeof global !== 'undefined') {
  (global as any).__ExpoImportMetaRegistry = {
    ImportMetaRegistry: {
      get: (id: string) => ({}),
      set: (id: string, value: any) => {},
    }
  };
  // Mock structuredClone to avoid expo polyfill issues
  if (!(global as any).structuredClone) {
    (global as any).structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
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

