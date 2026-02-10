import tsEslint from 'typescript-eslint';

export default [
  ...tsEslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,cts}'],
  })),
  {
    files: ['**/*.{ts,cts}'],
    languageOptions: {
      parser: tsEslint.parser,
      ecmaVersion: 'latest',
      parserOptions: {
        projectService: true,
      },
    },
  },
];
