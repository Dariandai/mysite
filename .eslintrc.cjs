module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:astro/recommended'],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  globals: {
    gsap: 'readonly',
    ScrollTrigger: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
    },
    {
      files: ['functions/**/*.js'],
      env: {
        browser: true,
        es2022: true,
      },
    },
  ],
  ignorePatterns: ['dist/', '.astro/', 'node_modules/'],
};
