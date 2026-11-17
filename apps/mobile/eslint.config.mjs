import expoConfig from 'eslint-config-expo/flat.js';

export default [
  ...expoConfig,
  { rules: { 'react-hooks/set-state-in-effect': 'off' } },
  { ignores: ['.expo/**', 'node_modules/**', 'coverage/**'] },
];
