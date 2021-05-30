module.exports = {
  overrides: [
    {
      files: ['src/**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended', 'airbnb-typescript/base'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      rules: {
        'arrow-body-style': 'off',
        'no-restricted-syntax': 'off',
        '@typescript-eslint/comma-dangle': ['off'],
        'import/no-cycle': ['off'],
        '@typescript-eslint/lines-between-class-members': ['off'],
        'operator-linebreak': ['off'],
        'arrow-parens': ['off'],
        'no-underscore-dangle': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        'import/prefer-default-export': ['off'],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error']
      }
    },
    {
      files: ['src/**/*.spec.ts', '**/__test__/**'],
      extends: ['plugin:@typescript-eslint/recommended', 'airbnb-typescript/base'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.specs.json',
        tsconfigRootDir: __dirname
      },
      rules: {
        'arrow-body-style': 'off',
        'no-restricted-syntax': 'off',
        '@typescript-eslint/comma-dangle': ['off'],
        'import/no-cycle': ['off'],
        '@typescript-eslint/lines-between-class-members': ['off'],
        'operator-linebreak': ['off'],
        'arrow-parens': ['off'],
        'no-underscore-dangle': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off']
      }
    }
  ]
};
