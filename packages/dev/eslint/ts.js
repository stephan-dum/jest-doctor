import tsEslint from 'typescript-eslint';

export default [
  ...tsEslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,cts,tsx,mts}'],
  })),
  {
    files: ['**/*.{ts,cts,tsx,mts}'],
    languageOptions: {
      parser: tsEslint.parser,
      ecmaVersion: 'latest',
      parserOptions: {
        projectService: true,
      },
    },
  },
];
