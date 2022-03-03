module.exports = {
  extends: ['@commitlint/config-conventional', './bin/config-lerna-scopes'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [0, 'always'],
  },
};
