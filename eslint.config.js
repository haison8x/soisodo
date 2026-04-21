const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  {
    settings: {
      react: {
        version: '19.1.0',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'dist/*',
      'node_modules/*',
      'ios/*',
      'android/*',
      '.expo/*',
      '*.d.ts',
    ],
  },
];
