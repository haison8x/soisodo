const expo = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['ui-audit/**', 'dist/**', 'node_modules/**', 'ios/**', 'android/**', '.expo/**'] },
  ...expo,
  {
    settings: {
      react: {
        version: '19.1.0',
      },
    },
  },
];
