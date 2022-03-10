module.exports = {
  extends: ['@nutol/eslint-config/eslintrc.js'],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};
