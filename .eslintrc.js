module.exports = {
  extends: ['@nutol/eslint-config/eslintrc.js'],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      },
    },
  ],
};
